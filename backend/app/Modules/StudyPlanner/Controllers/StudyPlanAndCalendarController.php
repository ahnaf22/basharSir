<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\LearningAnalytics\Actions\HeartbeatIngestionAction;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use App\Modules\StudyPlanner\Requests\CreateStudyPlanRequest;
use App\Modules\StudyPlanner\Requests\RescheduleStudyPlanItemRequest;
use App\Modules\StudyPlanner\Requests\StudyHeartbeatRequest;
use App\Modules\StudyPlanner\Resources\StudyPlanResource;
use App\Modules\StudyPlanner\Services\StudyPlanGeneratorService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

final class StudyPlanAndCalendarController extends Controller
{
    public function __construct(
        private readonly StudyPlanGeneratorService $planGenerator,
        private readonly HeartbeatIngestionAction $heartbeatAction,
    ) {}

    /**
     * POST /api/v1/study-plans
     */
    public function store(CreateStudyPlanRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        /** @var array<int, int> $chapterIds */
        $chapterIds = array_map('intval', (array) $request->validated('chapter_ids'));
        $targetDate = Carbon::parse((string) $request->validated('target_completion_date'));
        $dailyMins = (int) ($request->validated('daily_study_minutes') ?? $student->daily_study_target_mins);

        $plan = $this->planGenerator->generatePlan(
            student: $student,
            title: (string) $request->validated('title'),
            chapterIds: $chapterIds,
            targetCompletionDate: $targetDate,
            dailyStudyMinutes: $dailyMins,
        );

        return ApiResponse::success(
            data: new StudyPlanResource($plan),
            status: 201
        );
    }

    /**
     * GET /api/v1/study-plans/active
     */
    public function activePlan(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        /** @var StudyPlan|null $plan */
        $plan = StudyPlan::query()
            ->with('items')
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->latest('id')
            ->first();

        if ($plan === null) {
            return ApiResponse::success(data: null);
        }

        return ApiResponse::success(data: new StudyPlanResource($plan));
    }

    /**
     * POST /api/v1/study-plans/{studyPlan}/rebalance
     */
    public function rebalance(StudyPlan $studyPlan): JsonResponse
    {
        $studyPlan->loadMissing('student');
        Gate::authorize('update', $studyPlan->student);

        $rebalanced = $this->planGenerator->rebalanceAndReschedule($studyPlan);

        return ApiResponse::success(data: new StudyPlanResource($rebalanced));
    }

    /**
     * PATCH /api/v1/study-plan-items/{item}/reschedule
     */
    public function rescheduleItem(
        RescheduleStudyPlanItemRequest $request,
        StudyPlanItem $item,
    ): JsonResponse {
        $item->loadMissing(['student', 'studyPlan']);
        Gate::authorize('update', $item->student);

        $newDate = $request->validated('scheduled_date');
        $newStatus = $request->validated('status');
        $activeMins = $request->validated('actual_active_minutes');

        $updates = [];
        if (is_string($newDate) && $newDate !== '') {
            $updates['rescheduled_from_date'] = $item->rescheduled_from_date ?? $item->scheduled_date->toDateString();
            $updates['scheduled_date'] = $newDate;
            $updates['status'] = 'rescheduled';
        }
        if (is_string($newStatus) && $newStatus !== '') {
            $updates['status'] = $newStatus;
            if ($newStatus === 'completed') {
                $updates['completed_at'] = Carbon::now();
            } elseif ($item->completed_at !== null) {
                // Un-ticking a finished task must not leave a stale completion timestamp.
                $updates['completed_at'] = null;
            }
        }
        if ($activeMins !== null) {
            $updates['actual_active_minutes'] = (int) $activeMins;
        }

        if ($updates !== []) {
            $item->update($updates);
            $this->planGenerator->recalculateCompletionPercentage($item->studyPlan);
        }

        return ApiResponse::success(data: [
            'id' => $item->id,
            'scheduled_date' => $item->scheduled_date->toDateString(),
            'status' => $item->status,
            'rescheduled_from_date' => $item->rescheduled_from_date?->toDateString(),
            'actual_active_minutes' => $item->actual_active_minutes,
            'completed_at' => $item->completed_at?->toIso8601String(),
        ]);
    }

    /**
     * GET /api/v1/calendar
     */
    public function calendar(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        $startDate = $request->query('start_date')
            ? Carbon::parse((string) $request->query('start_date'))->toDateString()
            : Carbon::today()->subDays(7)->toDateString();

        $endDate = $request->query('end_date')
            ? Carbon::parse((string) $request->query('end_date'))->toDateString()
            : Carbon::today()->addDays(21)->toDateString();

        /** @var Collection<int, StudyPlanItem> $items */
        $items = StudyPlanItem::query()
            ->where('student_id', $student->id)
            ->whereBetween('scheduled_date', [$startDate, $endDate])
            ->orderBy('scheduled_date')
            ->orderBy('id')
            ->get();

        /** @var Collection<int, StudyTimeLog> $timeLogs */
        $timeLogs = StudyTimeLog::query()
            ->where('student_id', $student->id)
            ->whereBetween('study_date', [$startDate, $endDate])
            ->get();

        $totalActiveSeconds = (int) $timeLogs->sum('active_seconds');
        $totalPausedSeconds = (int) $timeLogs->sum('paused_seconds');

        return ApiResponse::success(data: [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_active_minutes' => (int) round($totalActiveSeconds / 60),
            'total_paused_minutes' => (int) round($totalPausedSeconds / 60),
            'items' => $items->map(fn (StudyPlanItem $item): array => [
                'id' => $item->id,
                'study_plan_id' => $item->study_plan_id,
                'task_type' => $item->task_type,
                'title_bn' => $item->title_bn,
                'scheduled_date' => $item->scheduled_date->toDateString(),
                'planned_minutes' => $item->planned_minutes,
                'actual_active_minutes' => $item->actual_active_minutes,
                'status' => $item->status,
                'rescheduled_from_date' => $item->rescheduled_from_date?->toDateString(),
            ])->values()->all(),
        ]);
    }

    /**
     * POST /api/v1/analytics/study-heartbeat
     */
    public function ingestHeartbeat(StudyHeartbeatRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        $log = $this->heartbeatAction->execute(
            student: $student,
            sourceType: (string) $request->validated('source_type'),
            sourceId: (int) $request->validated('source_id'),
            subjectId: $request->validated('subject_id') !== null
                ? (int) $request->validated('subject_id')
                : null,
            isIdle: (bool) ($request->validated('is_idle') ?? false),
            elapsedSeconds: (int) ($request->validated('elapsed_seconds') ?? 30),
            questionsAttemptedDelta: (int) ($request->validated('questions_attempted_delta') ?? 0),
        );

        return ApiResponse::success(data: [
            'log_id' => $log->id,
            'study_date' => $log->study_date->toDateString(),
            'active_seconds' => $log->active_seconds,
            'paused_seconds' => $log->paused_seconds,
            'questions_attempted' => $log->questions_attempted,
        ]);
    }
}
