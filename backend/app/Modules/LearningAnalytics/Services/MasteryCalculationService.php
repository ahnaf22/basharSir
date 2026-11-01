<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Services;

use App\Modules\LearningAnalytics\Models\MasteryEvidenceLog;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class MasteryCalculationService
{
    /**
     * Records verified assessment evidence and deterministically recalculates the student's
     * mastery score for `(student_id, curriculum_version_id, learning_objective_id)`.
     *
     * Non-negotiable architectural invariant:
     * - Simply conversing or answering guided practice with hints can NEVER push an objective
     *   into `proficient` (>= 75%) or `mastered` (>= 90%) without verified `mini_assessment`
     *   or `chapter_exam` / `model_exam` evidence.
     */
    public function recordEvidence(
        int $studentId,
        int $curriculumVersionId,
        int $learningObjectiveId,
        string $sourceType,
        int $sourceId,
        float $scoreRatio,
        string $difficulty = 'medium',
        int $hintsUsed = 0,
    ): MasteryRecord {
        $clampedRatio = max(0.0, min(1.0, $scoreRatio));

        $alpha = $this->sourceWeight($sourceType);
        $difficultyMultiplier = $this->difficultyMultiplier($difficulty);
        $hintPenalty = $this->hintPenaltyFactor($hintsUsed);

        // Evidence score E_i in [0, 1]
        $evidenceScore = min(1.0, $clampedRatio * $difficultyMultiplier * $hintPenalty);

        /** @var MasteryRecord $updatedRecord */
        $updatedRecord = DB::transaction(function () use (
            $studentId,
            $curriculumVersionId,
            $learningObjectiveId,
            $sourceType,
            $sourceId,
            $difficulty,
            $clampedRatio,
            $hintsUsed,
            $alpha,
            $evidenceScore
        ): MasteryRecord {
            /** @var MasteryRecord|null $record */
            $record = MasteryRecord::query()
                ->where('student_id', $studentId)
                ->where('curriculum_version_id', $curriculumVersionId)
                ->where('learning_objective_id', $learningObjectiveId)
                ->lockForUpdate()
                ->first();

            if ($record === null) {
                $record = MasteryRecord::query()->create([
                    'student_id' => $studentId,
                    'curriculum_version_id' => $curriculumVersionId,
                    'learning_objective_id' => $learningObjectiveId,
                    'mastery_score' => '0.00',
                    'mastery_status' => 'unstarted',
                    'attempts_count' => 0,
                    'correct_count' => 0,
                ]);
            }

            $prevMastery = (float) $record->mastery_score;

            // Weighted EMA formula: M_new = clamp(0, 100, (1 - alpha) * M_prev + alpha * (100 * E_i))
            // On the very first attempt, seed baseline so initial verified evidence registers cleanly
            $effectivePrev = $record->attempts_count === 0 ? (50.0 * $evidenceScore) : $prevMastery;
            $rawNewMastery = ((1.0 - $alpha) * $effectivePrev) + ($alpha * (100.0 * $evidenceScore));
            $clampedNewMastery = max(0.0, min(100.0, round($rawNewMastery, 2)));

            // Check whether student has any summative/unassisted assessment evidence (`mini_assessment`, `chapter_exam`, `model_exam`)
            $isSummativeSource = in_array($sourceType, ['mini_assessment', 'chapter_exam', 'model_exam'], true);
            $hasPriorSummativeEvidence = $isSummativeSource || MasteryEvidenceLog::query()
                ->where('mastery_record_id', $record->id)
                ->whereIn('source_type', ['mini_assessment', 'chapter_exam', 'model_exam'])
                ->where('score_ratio', '>=', 0.75)
                ->exists();

            // Hard invariant: without passing a mini_assessment or exam, cap mastery at 74.00 ('practicing')
            if (! $hasPriorSummativeEvidence && $clampedNewMastery >= 75.0) {
                $clampedNewMastery = 74.00;
            }

            $newAttempts = $record->attempts_count + 1;
            $newCorrect = $record->correct_count + ($clampedRatio >= 0.75 ? 1 : 0);
            $newStatus = $this->statusForScore($clampedNewMastery, $newAttempts);

            $reviewDays = match ($newStatus) {
                'mastered' => 21,
                'proficient' => 14,
                'practicing' => 5,
                default => 2,
            };

            $now = Carbon::now();

            MasteryEvidenceLog::query()->create([
                'mastery_record_id' => $record->id,
                'student_id' => $studentId,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'question_difficulty' => $difficulty,
                'score_ratio' => number_format($clampedRatio, 3, '.', ''),
                'hints_used' => max(0, $hintsUsed),
                'previous_mastery' => number_format($prevMastery, 2, '.', ''),
                'new_mastery' => number_format($clampedNewMastery, 2, '.', ''),
                'recorded_at' => $now,
            ]);

            $record->update([
                'mastery_score' => number_format($clampedNewMastery, 2, '.', ''),
                'mastery_status' => $newStatus,
                'attempts_count' => $newAttempts,
                'correct_count' => $newCorrect,
                'last_assessed_at' => $now,
                'next_review_due_at' => $now->copy()->addDays($reviewDays),
            ]);

            return $record->fresh() ?? $record;
        });

        return $updatedRecord;
    }

    /**
     * Applies gentle recency decay and flags `next_review_due_at` if an objective has not been
     * practiced for > 21 days without erasing historical achievement.
     */
    public function applyRecencyDecayIfStale(MasteryRecord $record): MasteryRecord
    {
        if ($record->last_assessed_at === null) {
            return $record;
        }

        $daysSince = $record->last_assessed_at->diffInDays(Carbon::now());
        if ($daysSince <= 21) {
            return $record;
        }

        $currentScore = (float) $record->mastery_score;
        // Gentle 5% decay floored at 50% so historical effort is preserved
        $decayedScore = max(min($currentScore, 50.0), round($currentScore * 0.95, 2));
        $newStatus = $this->statusForScore($decayedScore, $record->attempts_count);

        $record->update([
            'mastery_score' => number_format($decayedScore, 2, '.', ''),
            'mastery_status' => $newStatus,
            'next_review_due_at' => Carbon::now(),
        ]);

        return $record->fresh() ?? $record;
    }

    public function sourceWeight(string $sourceType): float
    {
        return match ($sourceType) {
            'prerequisite_check' => 0.15,
            'guided_practice' => 0.20,
            'mini_assessment' => 0.35,
            'chapter_exam', 'model_exam' => 0.45,
            default => 0.20,
        };
    }

    public function difficultyMultiplier(string $difficulty): float
    {
        return match ($difficulty) {
            'easy' => 0.85,
            'hard' => 1.15,
            default => 1.00,
        };
    }

    public function hintPenaltyFactor(int $hintsUsed): float
    {
        if ($hintsUsed <= 0) {
            return 1.00;
        }
        if ($hintsUsed === 1) {
            return 0.75;
        }

        return 0.50;
    }

    public function statusForScore(float $score, int $attemptsCount): string
    {
        if ($attemptsCount <= 0 && $score <= 0.0) {
            return 'unstarted';
        }
        if ($score < 50.0) {
            return 'struggling';
        }
        if ($score < 75.0) {
            return 'practicing';
        }
        if ($score < 90.0) {
            return 'proficient';
        }

        return 'mastered';
    }
}
