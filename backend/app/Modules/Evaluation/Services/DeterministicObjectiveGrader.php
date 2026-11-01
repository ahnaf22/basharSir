<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Services;

use App\Modules\Evaluation\Models\Evaluation;
use App\Modules\Examinations\Models\SubmittedAnswer;
use App\Modules\QuestionBank\Models\Question;

final class DeterministicObjectiveGrader
{
    public function isObjectiveQuestionType(string $questionType): bool
    {
        return in_array(
            $questionType,
            ['mcq_single', 'mcq_multi_statement', 'true_false', 'fill_blank'],
            true
        );
    }

    /**
     * Evaluates objective questions (`mcq_single`, `mcq_multi_statement`, `true_false`, `fill_blank`)
     * deterministically in code with 100% precision and zero LLM cost.
     */
    public function evaluate(SubmittedAnswer $submittedAnswer, Question $question): Evaluation
    {
        $answerKey = is_array($question->deterministic_answer_key_json)
            ? $question->deterministic_answer_key_json
            : [];

        $maxMarks = (float) $question->marks;
        $isCorrect = false;

        if (in_array($question->question_type, ['mcq_single', 'mcq_multi_statement', 'true_false'], true)) {
            $expectedKey = is_string($answerKey['correct_option_key'] ?? null)
                ? trim($answerKey['correct_option_key'])
                : '';
            $studentKey = $submittedAnswer->selected_option_key ?? $submittedAnswer->typed_answer_text ?? '';

            if ($expectedKey !== '' && $this->normalize($studentKey) === $this->normalize($expectedKey)) {
                $isCorrect = true;
            }
        } else {
            // fill_blank or exact canonical numeric/algebraic match
            $canonical = is_string($answerKey['canonical_answer'] ?? null)
                ? $answerKey['canonical_answer']
                : '';
            $equivalents = is_array($answerKey['accepted_equivalents'] ?? null)
                ? array_map('strval', $answerKey['accepted_equivalents'])
                : [];

            $studentText = $submittedAnswer->typed_answer_text ?? $submittedAnswer->selected_option_key ?? '';
            $normalizedStudent = $this->normalize($studentText);

            foreach (array_filter(array_merge([$canonical], $equivalents)) as $candidate) {
                if ($normalizedStudent !== '' && $normalizedStudent === $this->normalize($candidate)) {
                    $isCorrect = true;
                    break;
                }
            }
        }

        $awardedMarks = $isCorrect ? $maxMarks : 0.0;
        $explanationBn = is_string($answerKey['explanation_bn'] ?? null)
            ? $answerKey['explanation_bn']
            : ($isCorrect ? 'সঠিক উত্তর!' : 'উত্তরটি সঠিক হয়নি। এনসিটিবি পাঠ্যবইয়ের সংশ্লিষ্ট অংশটি পুনরায় দেখো।');

        /** @var Evaluation $evaluation */
        $evaluation = Evaluation::query()->updateOrCreate(
            ['submitted_answer_id' => $submittedAnswer->id],
            [
                'evaluator_type' => 'deterministic',
                'marks_awarded' => number_format($awardedMarks, 2, '.', ''),
                'max_marks' => number_format($maxMarks, 2, '.', ''),
                'confidence_score' => '1.000',
                'review_status' => 'auto_approved',
                'step_breakdown_json' => [
                    [
                        'step_id' => 'OBJECTIVE_CHECK',
                        'marks_awarded' => $awardedMarks,
                        'max_marks' => $maxMarks,
                        'is_correct' => $isCorrect,
                    ],
                ],
                'feedback_bn' => $explanationBn,
                'nctb_citation' => 'এনসিটিবি পাঠ্যবই নির্ধারিত উত্তরমালা',
            ]
        );

        return $evaluation;
    }

    public function normalize(string $text): string
    {
        $banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $asciiDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $converted = str_replace($banglaDigits, $asciiDigits, $text);
        $converted = str_replace(['²', '³', ' '], ['^2', '^3', ''], $converted);

        return mb_strtolower(trim($converted));
    }
}
