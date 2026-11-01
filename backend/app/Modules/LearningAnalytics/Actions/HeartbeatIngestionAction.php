<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Actions;

use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class HeartbeatIngestionAction
{
    public const DEFAULT_HEARTBEAT_INTERVAL_SECONDS = 30;

    public const IDLE_CUTOFF_SECONDS = 120;

    /**
     * Ingests a 30-second client study heartbeat and enforces the 120-second idle cutoff rule:
     * - Idle tab time (`isIdle = true` or gap > 120s since `last_heartbeat_at`) is NEVER counted
     *   toward `active_seconds`; it is recorded under `paused_seconds`.
     */
    public function execute(
        StudentProfile $student,
        string $sourceType,
        int $sourceId,
        ?int $subjectId = null,
        bool $isIdle = false,
        int $elapsedSeconds = self::DEFAULT_HEARTBEAT_INTERVAL_SECONDS,
        int $questionsAttemptedDelta = 0,
        ?Carbon $now = null,
    ): StudyTimeLog {
        $timestamp = $now ?? Carbon::now();
        $studyDate = $timestamp->toDateString();

        /** @var StudyTimeLog $log */
        $log = DB::transaction(function () use (
            $student,
            $sourceType,
            $sourceId,
            $subjectId,
            $isIdle,
            $elapsedSeconds,
            $questionsAttemptedDelta,
            $timestamp,
            $studyDate
        ): StudyTimeLog {
            /** @var StudyTimeLog|null $existing */
            $existing = StudyTimeLog::query()
                ->where('student_id', $student->id)
                ->whereDate('study_date', $studyDate)
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->lockForUpdate()
                ->first();

            $boundedDelta = max(0, min($elapsedSeconds, self::IDLE_CUTOFF_SECONDS));

            if ($existing === null) {
                return StudyTimeLog::query()->create([
                    'student_id' => $student->id,
                    'study_date' => $studyDate,
                    'subject_id' => $subjectId,
                    'source_type' => $sourceType,
                    'source_id' => $sourceId,
                    'session_start_at' => $timestamp->copy()->subSeconds($boundedDelta),
                    'last_heartbeat_at' => $timestamp,
                    'session_end_at' => $timestamp,
                    'active_seconds' => $isIdle ? 0 : min($boundedDelta, 60),
                    'paused_seconds' => $isIdle ? $boundedDelta : 0,
                    'questions_attempted' => max(0, $questionsAttemptedDelta),
                ]);
            }

            $secondsSinceLastPing = (int) abs($timestamp->diffInSeconds($existing->last_heartbeat_at));
            $exceededIdleCutoff = $secondsSinceLastPing > self::IDLE_CUTOFF_SECONDS;

            if ($isIdle || $exceededIdleCutoff) {
                $addedPaused = min(max($elapsedSeconds, $secondsSinceLastPing), 600);
                $existing->update([
                    'last_heartbeat_at' => $timestamp,
                    'session_end_at' => $timestamp,
                    'paused_seconds' => $existing->paused_seconds + $addedPaused,
                    'questions_attempted' => $existing->questions_attempted + max(0, $questionsAttemptedDelta),
                ]);
            } else {
                $addedActive = min($boundedDelta, 60);
                $existing->update([
                    'last_heartbeat_at' => $timestamp,
                    'session_end_at' => $timestamp,
                    'active_seconds' => $existing->active_seconds + $addedActive,
                    'questions_attempted' => $existing->questions_attempted + max(0, $questionsAttemptedDelta),
                ]);
            }

            return $existing->fresh() ?? $existing;
        });

        return $log;
    }
}
