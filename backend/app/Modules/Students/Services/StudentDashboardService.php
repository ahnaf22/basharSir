<?php

declare(strict_types=1);

namespace App\Modules\Students\Services;

use App\Models\User;
use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Models\Exam;
use App\Modules\Gamification\Domain\Models\StudentBadge;
use App\Modules\Gamification\Domain\Models\StudentStreak;
use App\Modules\Gamification\Domain\Models\XpLedger;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use App\Modules\Tutoring\Models\TutorSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Aggregates the read-model behind the student "study desk" home screen.
 *
 * Everything here is derived from persisted evidence (plans, sessions, study-time logs,
 * mastery records, XP ledger). Nothing is invented for presentation purposes.
 */
final class StudentDashboardService
{
    /** Linear level curve: every level costs this many XP. */
    public const XP_PER_LEVEL = 250;

    /** Streak milestones that unlock badges, ascending. */
    private const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

    /** Mastery score (percent) at or above which a learning objective counts as solid. */
    private const MASTERED_SCORE = 75.0;

    /** Max objective blocks sent per subject (UI shows one block per objective). */
    private const MAX_MASTERY_BLOCKS = 12;

    /**
     * @return array<string, mixed>
     */
    public function build(User $user, StudentProfile $student): array
    {
        $today = Carbon::today();
        $todayTasks = $this->todayTasks($student, $today);
        $continueLesson = $this->continueLesson($student, $todayTasks);
        $streak = StudentStreak::query()->where('student_id', $student->id)->first();
        $academicClass = AcademicClass::query()->where('grade_level', $student->current_class_level)->first();

        $todaySeconds = (int) StudyTimeLog::query()
            ->where('student_id', $student->id)
            ->whereDate('study_date', $today)
            ->sum('active_seconds');

        return [
            'student' => [
                'student_code' => $student->student_code,
                'name_bn' => $user->name_bn,
                'name_en' => $user->name_en,
                'current_class_level' => $student->current_class_level,
                'medium' => $student->medium->value,
                'daily_study_target_mins' => $student->daily_study_target_mins,
            ],
            'continue_lesson' => $continueLesson,
            'next_lesson' => $continueLesson === null ? $this->nextLesson($todayTasks) : null,
            'today_tasks' => $todayTasks,
            'streak' => [
                'current_days' => $streak->current_streak_days ?? 0,
                'longest_days' => $streak->longest_streak_days ?? 0,
                'freezes_available' => $streak->streak_freezes_available ?? 1,
                'last_active_date' => $streak?->last_active_date?->format('Y-m-d'),
                'week' => $this->weekActivity($student, $streak, $today),
                'next_milestone' => $this->nextStreakMilestone($streak->current_streak_days ?? 0),
            ],
            'gamification' => $this->gamification($student),
            'today_study_time' => [
                'active_seconds' => $todaySeconds,
                'active_minutes' => round($todaySeconds / 60, 1),
                'target_minutes' => $student->daily_study_target_mins,
            ],
            'subject_mastery' => $academicClass !== null ? $this->subjectMastery($student, $academicClass) : [],
            'upcoming_exams' => $academicClass !== null ? $this->upcomingExams($academicClass) : [],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function todayTasks(StudentProfile $student, Carbon $today): array
    {
        $plan = StudyPlan::query()
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->latest('id')
            ->first();

        if ($plan === null) {
            return [];
        }

        $items = StudyPlanItem::query()
            ->with(['subject', 'chapter'])
            ->where('study_plan_id', $plan->id)
            ->whereDate('scheduled_date', $today)
            ->orderBy('id')
            ->get();

        $tasks = [];
        foreach ($items as $item) {
            $tasks[] = [
                'id' => $item->id,
                'title_bn' => $item->title_bn,
                'task_type' => $item->task_type,
                'subject_title_bn' => $item->subject->title_bn,
                'chapter_title_bn' => $item->chapter->title_bn,
                'chapter_number' => $item->chapter->chapter_number,
                'estimated_minutes' => $item->planned_minutes,
                'actual_active_minutes' => $item->actual_active_minutes,
                'status' => $item->status,
                'learning_objective_id' => $item->learning_objective_id,
            ];
        }

        return $tasks;
    }

    /**
     * @param  array<int, array<string, mixed>>  $todayTasks
     * @return array<string, mixed>|null
     */
    private function continueLesson(StudentProfile $student, array $todayTasks): ?array
    {
        /** @var TutorSession|null $session */
        $session = TutorSession::query()
            ->with(['activeObjective.topic.chapter.subject'])
            ->where('student_id', $student->id)
            ->whereIn('session_status', ['active', 'paused'])
            ->orderByDesc('updated_at')
            ->first();

        if ($session === null) {
            return null;
        }

        $objective = $session->activeObjective;
        $chapter = $objective->topic->chapter;

        // Remaining time is only reported when today's plan actually budgets this objective.
        $remaining = null;
        foreach ($todayTasks as $task) {
            if ($task['learning_objective_id'] === $objective->id) {
                $spentMinutes = (int) round($session->active_duration_seconds / 60);
                $remaining = max(0, (int) $task['estimated_minutes'] - $spentMinutes);
                break;
            }
        }

        return [
            'session_id' => $session->id,
            'session_uuid' => $session->uuid,
            'current_stage' => $session->current_stage,
            'learning_objective_id' => $objective->id,
            'title_bn' => $objective->title_bn,
            'chapter_title_bn' => $chapter->title_bn,
            'chapter_number' => $chapter->chapter_number,
            'subject_title_bn' => $chapter->subject->title_bn,
            'active_duration_seconds' => $session->active_duration_seconds,
            'estimated_remaining_minutes' => $remaining,
        ];
    }

    /**
     * The first unfinished planned task that targets a learning objective, so the
     * hero card can start a brand-new lesson when no session is open.
     *
     * @param  array<int, array<string, mixed>>  $todayTasks
     * @return array<string, mixed>|null
     */
    private function nextLesson(array $todayTasks): ?array
    {
        foreach ($todayTasks as $task) {
            if ($task['status'] !== 'completed' && $task['learning_objective_id'] !== null) {
                return [
                    'learning_objective_id' => $task['learning_objective_id'],
                    'title_bn' => $task['title_bn'],
                    'chapter_title_bn' => $task['chapter_title_bn'],
                    'chapter_number' => $task['chapter_number'],
                    'subject_title_bn' => $task['subject_title_bn'],
                    'estimated_minutes' => $task['estimated_minutes'],
                ];
            }
        }

        return null;
    }

    /**
     * Saturday-first school week containing today. A day counts as studied when a study-time
     * log exists for it, or when it falls inside the student's current streak run.
     *
     * @return array<int, array{date: string, weekday: int, studied: bool, is_today: bool}>
     */
    private function weekActivity(StudentProfile $student, ?StudentStreak $streak, Carbon $today): array
    {
        // Carbon dayOfWeek: 0 = Sunday ... 6 = Saturday. Offset back to the latest Saturday.
        $weekStart = $today->copy()->subDays(($today->dayOfWeek + 1) % 7);
        $weekEnd = $weekStart->copy()->addDays(6);

        $loggedDates = StudyTimeLog::query()
            ->where('student_id', $student->id)
            ->whereBetween('study_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->where('active_seconds', '>', 0)
            ->pluck('study_date')
            ->map(fn ($d): string => Carbon::parse($d)->toDateString())
            ->all();

        // Dates covered by the current streak run, ending on the last active day.
        $streakDates = [];
        $lastActive = $streak?->last_active_date;
        if ($streak !== null && $lastActive !== null) {
            for ($n = 0; $n < $streak->current_streak_days; $n++) {
                $streakDates[] = $lastActive->copy()->subDays($n)->toDateString();
            }
        }

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $weekStart->copy()->addDays($i);
            $key = $date->toDateString();
            $days[] = [
                'date' => $key,
                'weekday' => $date->dayOfWeek,
                'studied' => in_array($key, $loggedDates, true) || in_array($key, $streakDates, true),
                'is_today' => $date->isSameDay($today),
            ];
        }

        return $days;
    }

    /**
     * @return array{target_days: int, remaining_days: int}
     */
    private function nextStreakMilestone(int $currentDays): array
    {
        foreach (self::STREAK_MILESTONES as $target) {
            if ($currentDays < $target) {
                return ['target_days' => $target, 'remaining_days' => $target - $currentDays];
            }
        }

        $last = self::STREAK_MILESTONES[array_key_last(self::STREAK_MILESTONES)];

        return ['target_days' => $last, 'remaining_days' => 0];
    }

    /**
     * @return array<string, mixed>
     */
    private function gamification(StudentProfile $student): array
    {
        $totalXp = (int) XpLedger::query()->where('student_id', $student->id)->sum('xp_points');
        $badges = StudentBadge::query()
            ->where('student_id', $student->id)
            ->orderByDesc('awarded_at')
            ->limit(5)
            ->get();

        $level = intdiv(max(0, $totalXp), self::XP_PER_LEVEL) + 1;

        return [
            'total_xp' => $totalXp,
            'badges_count' => StudentBadge::query()->where('student_id', $student->id)->count(),
            'badges' => $badges,
            'level' => [
                'number' => $level,
                'xp_into_level' => $totalXp % self::XP_PER_LEVEL,
                'xp_per_level' => self::XP_PER_LEVEL,
                'next_level_total_xp' => $level * self::XP_PER_LEVEL,
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function subjectMastery(StudentProfile $student, AcademicClass $academicClass): array
    {
        $subjects = Subject::query()
            ->where('class_id', $academicClass->id)
            ->with(['chapters' => fn ($q) => $q->orderBy('sort_order'), 'chapters.topics.learningObjectives'])
            ->get();

        $allObjectiveIds = $subjects
            ->flatMap(fn (Subject $s) => $s->chapters)
            ->flatMap(fn ($ch) => $ch->topics)
            ->flatMap(fn ($tp) => $tp->learningObjectives)
            ->pluck('id')
            ->all();

        /** @var Collection<int, MasteryRecord> $records */
        $records = $allObjectiveIds === []
            ? collect()
            : MasteryRecord::query()
                ->where('student_id', $student->id)
                ->whereIn('learning_objective_id', $allObjectiveIds)
                ->get()
                ->keyBy('learning_objective_id');

        $result = [];
        foreach ($subjects as $subject) {
            $objectives = [];
            $nextChapter = null;

            foreach ($subject->chapters as $chapter) {
                $chapterHasGap = false;
                foreach ($chapter->topics as $topic) {
                    foreach ($topic->learningObjectives as $objective) {
                        $record = $records->get($objective->id);
                        $score = $record !== null ? (float) $record->mastery_score : null;
                        $state = $score === null
                            ? 'not_started'
                            : ($score >= self::MASTERED_SCORE ? 'mastered' : 'in_progress');
                        if ($state !== 'mastered') {
                            $chapterHasGap = true;
                        }
                        $objectives[] = ['id' => $objective->id, 'state' => $state];
                    }
                }
                if ($nextChapter === null && $chapterHasGap) {
                    $nextChapter = [
                        'id' => $chapter->id,
                        'chapter_number' => $chapter->chapter_number,
                        'title_bn' => $chapter->title_bn,
                    ];
                }
            }

            $mastered = count(array_filter($objectives, fn (array $o): bool => $o['state'] === 'mastered'));
            $attempted = count(array_filter($objectives, fn (array $o): bool => $o['state'] !== 'not_started'));
            $subjectRecords = collect($objectives)->map(fn (array $o) => $records->get($o['id']))->filter();

            $result[] = [
                'id' => $subject->id,
                'title_bn' => $subject->title_bn,
                'title_en' => $subject->title_en,
                'subject_code' => $subject->nctb_subject_code,
                'mastery_pct' => $subjectRecords->isNotEmpty() ? round((float) $subjectRecords->avg('mastery_score'), 1) : 0.0,
                'total_chapters' => $subject->chapters->count(),
                'total_objectives' => count($objectives),
                'mastered_objectives' => $mastered,
                'attempted_objectives' => $attempted,
                'objectives' => array_slice($objectives, 0, self::MAX_MASTERY_BLOCKS),
                'next_chapter' => $nextChapter,
            ];
        }

        return $result;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function upcomingExams(AcademicClass $academicClass): array
    {
        $exams = Exam::query()
            ->with('subject')
            ->whereHas('subject', fn ($q) => $q->where('class_id', $academicClass->id))
            ->latest('id')
            ->limit(4)
            ->get();

        $result = [];
        foreach ($exams as $exam) {
            /** @var array<string, int> $counts */
            $counts = (array) ($exam->question_blueprint_json['counts_by_type'] ?? []);
            $mcq = 0;
            $creative = 0;
            foreach ($counts as $type => $n) {
                if (str_starts_with((string) $type, 'mcq')) {
                    $mcq += (int) $n;
                } elseif (str_starts_with((string) $type, 'creative')) {
                    $creative += (int) $n;
                }
            }

            $result[] = [
                'id' => $exam->id,
                'title_bn' => $exam->title_bn,
                'subject_title_bn' => $exam->subject->title_bn,
                'exam_type' => $exam->exam_type,
                'duration_minutes' => $exam->duration_minutes,
                'total_marks' => $exam->total_marks,
                'question_count' => (int) array_sum($counts),
                'mcq_count' => $mcq,
                'creative_count' => $creative,
            ];
        }

        return $result;
    }
}
