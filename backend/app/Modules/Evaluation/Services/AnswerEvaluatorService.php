<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Services;

use App\Core\Exceptions\DomainException;
use App\Modules\AI\Services\AIOrchestrator;
use App\Modules\Evaluation\Models\Evaluation;
use App\Modules\Examinations\Models\SubmittedAnswer;
use App\Modules\QuestionBank\Models\MarkingRubric;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;

final class AnswerEvaluatorService
{
    public const CONFIDENCE_GATE_THRESHOLD = 0.80;

    public function __construct(
        private readonly AIOrchestrator $aiOrchestrator,
        private readonly DeterministicObjectiveGrader $objectiveGrader,
    ) {}

    /**
     * Evaluates a typed written, math, or creative (সৃজনশীল) answer strictly against a
     * structured MarkingRubric. Never grades without a database MarkingRubric.
     */
    public function evaluateAgainstRubric(
        SubmittedAnswer $submittedAnswer,
        Question $question,
        ?StudentProfile $student = null,
        ?float $simulatedConfidenceOverride = null,
    ): Evaluation {
        $question->loadMissing('markingRubric');
        /** @var MarkingRubric|null $rubric */
        $rubric = $question->markingRubric;

        if ($rubric === null) {
            throw new DomainException(
                errorCode: 'MARKING_RUBRIC_REQUIRED',
                message: 'এই প্রশ্নের মূল্যায়নের জন্য নির্ধারিত মার্কিং রুব্রিক পাওয়া যায়নি।',
                httpStatus: 422,
            );
        }

        $studentText = trim((string) ($submittedAnswer->typed_answer_text ?? ''));
        $normalizedAnswer = $this->objectiveGrader->normalize($studentText);
        $maxMarks = (float) $question->marks;

        // Check common mistakes first
        $commonMistakes = $rubric->common_mistakes_json ?? [];
        $detectedMistakes = [];
        foreach ($commonMistakes as $mistake) {
            $trigger = is_string($mistake['trigger_keyword'] ?? null)
                ? $this->objectiveGrader->normalize($mistake['trigger_keyword'])
                : '';
            if ($trigger !== '' && str_contains($normalizedAnswer, $trigger)) {
                $detectedMistakes[] = [
                    'code' => (string) ($mistake['code'] ?? 'COMMON_MISTAKE'),
                    'description_bn' => (string) ($mistake['description_bn'] ?? ''),
                ];
            }
        }

        // Step-wise rubric evaluation with strict per-step mark clamping
        $steps = $rubric->step_wise_marks_json;
        $stepBreakdown = [];
        $totalAwarded = 0.0;
        $missingPointsBn = [];

        foreach ($steps as $step) {
            $stepId = (string) ($step['step_id'] ?? 'STEP');
            $stepDescBn = (string) ($step['description_bn'] ?? '');
            $stepMaxMarks = max(0.0, (float) ($step['marks'] ?? 0.0));
            $keywords = is_array($step['required_keywords'] ?? null)
                ? array_map('strval', $step['required_keywords'])
                : [];

            $matchedKeyword = false;
            foreach ($keywords as $kw) {
                $normKw = $this->objectiveGrader->normalize($kw);
                if ($normKw !== '' && str_contains($normalizedAnswer, $normKw)) {
                    $matchedKeyword = true;
                    break;
                }
            }

            // Clamp step marks strictly to [0.0, stepMaxMarks]
            $stepAwarded = $matchedKeyword ? $stepMaxMarks : 0.0;
            $stepAwarded = max(0.0, min($stepMaxMarks, $stepAwarded));
            $totalAwarded += $stepAwarded;

            if (! $matchedKeyword) {
                $missingPointsBn[] = $stepDescBn;
            }

            $stepBreakdown[] = [
                'step_id' => $stepId,
                'description_bn' => $stepDescBn,
                'marks_awarded' => $stepAwarded,
                'max_marks' => $stepMaxMarks,
                'achieved' => $matchedKeyword,
            ];
        }

        // Clamp total awarded marks strictly to [0.0, maxMarks]
        $clampedTotalAwarded = max(0.0, min($maxMarks, round($totalAwarded, 2)));

        // Invoke AIOrchestrator to log the rubric evaluation & generate constructive Bangla feedback
        $aiResult = $this->aiOrchestrator->dispatch(
            aiService: 'answer_evaluator',
            systemPrompt: 'Evaluate student answer against NCTB MarkingRubric JSON.',
            userPrompt: "Question: {$question->stem_markdown}\nAnswer: {$studentText}",
            student: $student,
            modelTier: 'frontier',
            structuredContext: [
                'max_marks' => $maxMarks,
                'awarded_marks' => $clampedTotalAwarded,
            ]
        );

        $confidence = $simulatedConfidenceOverride
            ?? (float) ($aiResult->structuredPayload['confidence_score'] ?? 0.92);
        $confidence = max(0.0, min(1.0, round($confidence, 3)));

        // Confidence gate: >= 0.80 -> provisional, < 0.80 -> flagged_for_human
        $reviewStatus = $confidence >= self::CONFIDENCE_GATE_THRESHOLD
            ? 'provisional'
            : 'flagged_for_human';

        $feedbackParts = [];
        if ($clampedTotalAwarded >= $maxMarks) {
            $feedbackParts[] = 'অসাধারণ! এনসিটিবি রুব্রিকের সকল ধাপ সঠিকভাবে সম্পন্ন হয়েছে।';
        } else {
            $feedbackParts[] = 'ধাপভিত্তিক মূল্যায়ন সম্পন্ন হয়েছে।';
            if ($missingPointsBn !== []) {
                $feedbackParts[] = 'অনুপস্থিত ধাপ: '.implode('; ', $missingPointsBn).'।';
            }
        }
        foreach ($detectedMistakes as $mistakeItem) {
            $feedbackParts[] = 'লক্ষ্য করো: '.$mistakeItem['description_bn'].'।';
        }

        /** @var Evaluation $evaluation */
        $evaluation = Evaluation::query()->updateOrCreate(
            ['submitted_answer_id' => $submittedAnswer->id],
            [
                'evaluator_type' => 'ai_rubric',
                'marks_awarded' => number_format($clampedTotalAwarded, 2, '.', ''),
                'max_marks' => number_format($maxMarks, 2, '.', ''),
                'confidence_score' => number_format($confidence, 3, '.', ''),
                'review_status' => $reviewStatus,
                'step_breakdown_json' => [
                    'steps' => $stepBreakdown,
                    'missing_points_bn' => $missingPointsBn,
                    'detected_mistakes' => $detectedMistakes,
                ],
                'feedback_bn' => implode(' ', $feedbackParts),
                'nctb_citation' => $rubric->nctb_reference ?? 'এনসিটিবি পাঠ্যবই মূল্যায়ন রুব্রিক',
            ]
        );

        return $evaluation;
    }
}
