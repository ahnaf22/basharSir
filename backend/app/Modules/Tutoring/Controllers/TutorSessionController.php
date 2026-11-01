<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\AI\Models\AiQualityFlag;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\Tutoring\Models\TutorMessage;
use App\Modules\Tutoring\Models\TutorSession;
use App\Modules\Tutoring\Requests\FlagTutorMessageRequest;
use App\Modules\Tutoring\Requests\PauseTutorSessionRequest;
use App\Modules\Tutoring\Requests\StartTutorSessionRequest;
use App\Modules\Tutoring\Requests\SubmitTutorTurnRequest;
use App\Modules\Tutoring\Resources\TutorSessionResource;
use App\Modules\Tutoring\Services\TutorEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class TutorSessionController extends Controller
{
    public function __construct(
        private readonly TutorEngineService $tutorEngine,
    ) {}

    /**
     * POST /api/v1/tutor-sessions
     */
    public function start(StartTutorSessionRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error(
                code: 'STUDENT_PROFILE_NOT_FOUND',
                message: 'Student profile is required.',
                status: 404
            );
        }

        /** @var LearningObjective $objective */
        $objective = LearningObjective::query()->findOrFail((int) $request->validated('learning_objective_id'));

        $session = $this->tutorEngine->startOrResumeSession($student, $objective);

        $mastery = MasteryRecord::query()
            ->where('student_id', $student->id)
            ->where('curriculum_version_id', $session->curriculum_version_id)
            ->where('learning_objective_id', $objective->id)
            ->first();

        return ApiResponse::success(
            data: new TutorSessionResource($session, $mastery),
            status: 201
        );
    }

    /**
     * GET /api/v1/tutor-sessions/{session}
     */
    public function show(Request $request, TutorSession $session): JsonResponse
    {
        $session->loadMissing(['student', 'messages', 'activeObjective', 'topic']);
        Gate::authorize('view', $session->student);

        $mastery = MasteryRecord::query()
            ->where('student_id', $session->student_id)
            ->where('curriculum_version_id', $session->curriculum_version_id)
            ->where('learning_objective_id', $session->active_objective_id)
            ->first();

        return ApiResponse::success(
            data: new TutorSessionResource($session, $mastery)
        );
    }

    /**
     * POST /api/v1/tutor-sessions/{session}/turns
     */
    public function submitTurn(SubmitTutorTurnRequest $request, TutorSession $session): JsonResponse
    {
        $session->loadMissing('student');
        Gate::authorize('update', $session->student);

        $result = $this->tutorEngine->processTurn(
            session: $session,
            clientTurnId: (string) $request->validated('client_turn_id'),
            studentActionType: (string) $request->validated('action_type'),
            studentInputText: $request->validated('student_input_text') !== null
                ? (string) $request->validated('student_input_text')
                : null,
        );

        return ApiResponse::success(
            data: new TutorSessionResource($result['session'], $result['mastery_record']),
            meta: [
                'idempotent_replay' => $result['idempotent_replay'],
            ]
        );
    }

    /**
     * POST /api/v1/tutor-sessions/{session}/pause
     */
    public function pause(PauseTutorSessionRequest $request, TutorSession $session): JsonResponse
    {
        $session->loadMissing(['student', 'messages', 'activeObjective', 'topic']);
        Gate::authorize('update', $session->student);

        $deltaSeconds = (int) ($request->validated('active_duration_delta_seconds') ?? 0);

        $session->update([
            'session_status' => $session->session_status === 'completed' ? 'completed' : 'paused',
            'active_duration_seconds' => $session->active_duration_seconds + $deltaSeconds,
        ]);

        $mastery = MasteryRecord::query()
            ->where('student_id', $session->student_id)
            ->where('curriculum_version_id', $session->curriculum_version_id)
            ->where('learning_objective_id', $session->active_objective_id)
            ->first();

        return ApiResponse::success(
            data: new TutorSessionResource($session->fresh(['messages', 'activeObjective', 'topic']) ?? $session, $mastery)
        );
    }

    /**
     * POST /api/v1/tutor-sessions/{session}/flag
     */
    public function flagMessage(FlagTutorMessageRequest $request, TutorSession $session): JsonResponse
    {
        $session->loadMissing('student');
        Gate::authorize('update', $session->student);

        /** @var TutorMessage $tutorMessage */
        $tutorMessage = TutorMessage::query()
            ->where('tutor_session_id', $session->id)
            ->findOrFail((int) $request->validated('tutor_message_id'));

        $flag = AiQualityFlag::query()->create([
            'ai_request_id' => $tutorMessage->ai_request_id,
            'student_id' => $session->student_id,
            'source_type' => 'tutor_message',
            'source_id' => $tutorMessage->id,
            'reason_code' => (string) $request->validated('reason_code'),
            'student_comment' => $request->validated('student_comment') !== null
                ? (string) $request->validated('student_comment')
                : null,
            'status' => 'open',
        ]);

        return ApiResponse::success(
            data: [
                'flag_id' => $flag->id,
                'status' => $flag->status,
                'message_bn' => 'তোমার রিপোর্টটি আমাদের একাডেমিক রিভিউ টিমের কাছে পাঠানো হয়েছে। ধন্যবাদ!',
            ],
            status: 201
        );
    }
}
