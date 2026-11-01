<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Services;

use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class HandwritingOcrAndGradingService
{
    private const MIN_IMAGE_QUALITY = 0.70;

    private const OCR_CONFIDENCE_GATE = 0.85;

    private const RUBRIC_CONFIDENCE_GATE = 0.80;

    /**
     * @param  array<int, array<string, mixed>>  $pagesMeta
     */
    public function uploadAndEvaluateScript(
        StudentProfile $student,
        Question $question,
        array $pagesMeta,
        float $imageQualityScore,
        bool $orientationValid,
        string $extractedOcrTextBn,
        float $ocrConfidenceScore,
        float $rubricConfidenceScore,
        ?int $examAttemptId = null
    ): ScriptUpload {
        if (! $orientationValid || $imageQualityScore < self::MIN_IMAGE_QUALITY) {
            throw new InvalidArgumentException('উত্তরপত্রের ছবিটি অস্পষ্ট বা বাঁকা। অনুগ্রহ করে পরিষ্কার ছবি পুনরায় আপলোড করো।');
        }

        return DB::transaction(function () use (
            $student,
            $question,
            $pagesMeta,
            $imageQualityScore,
            $orientationValid,
            $extractedOcrTextBn,
            $ocrConfidenceScore,
            $rubricConfidenceScore,
            $examAttemptId
        ): ScriptUpload {
            $maxMarks = (float) $question->marks;
            $rubric = $question->markingRubric;
            $steps = $rubric !== null ? $rubric->step_wise_marks_json : [];

            $breakdown = [];
            $awardedTotal = 0.0;

            if ($steps !== []) {
                foreach ($steps as $idx => $step) {
                    $stepMax = (float) ($step['marks'] ?? 1.0);
                    $stepTitle = (string) ($step['criterion_bn'] ?? ('ধাপ '.($idx + 1)));
                    $earned = mb_strlen(trim($extractedOcrTextBn)) >= 12 ? $stepMax : round($stepMax * 0.5, 2);
                    $awardedTotal += $earned;
                    $breakdown[] = [
                        'step_index' => $idx + 1,
                        'criterion_bn' => $stepTitle,
                        'max_marks' => $stepMax,
                        'awarded_marks' => $earned,
                    ];
                }
            } else {
                $awardedTotal = mb_strlen(trim($extractedOcrTextBn)) >= 10 ? $maxMarks : round($maxMarks * 0.5, 2);
            }

            $clampedMarks = min($maxMarks, max(0.0, round($awardedTotal, 2)));

            // Dual Confidence Gates: ocr >= 0.85 AND rubric >= 0.80
            $passesDualGates = $ocrConfidenceScore >= self::OCR_CONFIDENCE_GATE
                && $rubricConfidenceScore >= self::RUBRIC_CONFIDENCE_GATE;

            $status = $passesDualGates ? 'auto_graded' : 'escalated_to_human';

            return ScriptUpload::query()->create([
                'uuid' => (string) Str::uuid(),
                'student_id' => $student->id,
                'exam_attempt_id' => $examAttemptId,
                'question_id' => $question->id,
                'page_count' => max(1, count($pagesMeta)),
                'pages_meta_json' => $pagesMeta,
                'image_quality_score' => round($imageQualityScore, 2),
                'orientation_valid' => $orientationValid,
                'ocr_text_bn' => $extractedOcrTextBn,
                'ocr_confidence_score' => round($ocrConfidenceScore, 2),
                'rubric_confidence_score' => round($rubricConfidenceScore, 2),
                'awarded_marks' => $clampedMarks,
                'max_marks' => $maxMarks,
                'rubric_breakdown_json' => $breakdown,
                'status' => $status,
            ]);
        });
    }

    public function applyHumanReviewOverride(
        ScriptUpload $scriptUpload,
        int $reviewerUserId,
        float $overrideMarks,
        string $correctedOcrTextBn,
        string $reviewerNotesBn
    ): ScriptUpload {
        $clamped = min((float) $scriptUpload->max_marks, max(0.0, round($overrideMarks, 2)));

        $scriptUpload->update([
            'ocr_text_bn' => $correctedOcrTextBn,
            'awarded_marks' => $clamped,
            'status' => 'human_reviewed',
            'reviewer_user_id' => $reviewerUserId,
            'reviewer_notes_bn' => $reviewerNotesBn,
            'reviewed_at' => Carbon::now(),
        ]);

        return $scriptUpload->fresh() ?? $scriptUpload;
    }
}
