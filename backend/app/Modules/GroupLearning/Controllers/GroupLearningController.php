<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Controllers;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\GroupLearning\Domain\Models\GroupBroadcastQuestion;
use App\Modules\GroupLearning\Domain\Models\GroupParticipant;
use App\Modules\GroupLearning\Domain\Models\GroupSession;
use App\Modules\GroupLearning\Services\GroupTutoringService;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class GroupLearningController
{
    public function __construct(
        private readonly GroupTutoringService $groupTutoringService
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = StudentProfile::query()->where('user_id', $user->id)->first();

        $query = GroupSession::query()->withCount([
            'participants as active_participants_count' => static function ($q): void {
                $q->where('is_kicked', false);
            },
        ])->orderByDesc('id');

        if ($student !== null) {
            $query->where('target_class_level', $student->current_class_level);
        }

        return ApiResponse::success(
            data: [
                'group_sessions' => $query->get(),
            ],
            message: 'গ্রুপ স্টাডি রুমের তালিকা লোড হয়েছে।'
        );
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = StudentProfile::query()->where('user_id', $user->id)->first();

        $validated = $request->validate([
            'learning_objective_id' => ['required', 'integer', 'exists:learning_objectives,id'],
            'title_bn' => ['required', 'string', 'max:200'],
            'target_class_level' => ['nullable', 'integer', 'min:1', 'max:10'],
            'target_medium' => ['nullable', 'string', 'in:bangla,english'],
            'min_participants' => ['nullable', 'integer', 'min:2', 'max:5'],
            'max_participants' => ['nullable', 'integer', 'min:2', 'max:5'],
            'join_code' => ['nullable', 'string', 'max:32'],
            'shared_board_markdown_bn' => ['nullable', 'string'],
        ]);

        /** @var LearningObjective $objective */
        $objective = LearningObjective::query()->findOrFail((int) $validated['learning_objective_id']);

        try {
            $session = $this->groupTutoringService->createCohortSession(
                objective: $objective,
                titleBn: (string) $validated['title_bn'],
                targetClassLevel: isset($validated['target_class_level'])
                    ? (int) $validated['target_class_level']
                    : ($student !== null ? $student->current_class_level : 8),
                targetMedium: isset($validated['target_medium']) ? (string) $validated['target_medium'] : 'bangla',
                minParticipants: isset($validated['min_participants']) ? (int) $validated['min_participants'] : 3,
                maxParticipants: isset($validated['max_participants']) ? (int) $validated['max_participants'] : 5,
                joinCode: isset($validated['join_code']) ? (string) $validated['join_code'] : null,
                sharedBoardMarkdownBn: isset($validated['shared_board_markdown_bn']) ? (string) $validated['shared_board_markdown_bn'] : null
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'INVALID_GROUP_COHORT_CONFIG',
                message: $e->getMessage(),
                status: 422
            );
        }

        return ApiResponse::success(
            data: ['group_session' => $session],
            message: 'নতুন গ্রুপ স্টাডি রুম তৈরি হয়েছে।',
            status: 201
        );
    }

    public function show(Request $request, GroupSession $groupSession): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = StudentProfile::query()->where('user_id', $user->id)->first();

        return ApiResponse::success(
            data: $this->groupTutoringService->getRoomSnapshot($groupSession, $student),
            message: 'গ্রুপ স্টাডি রুমের তথ্য লোড হয়েছে।'
        );
    }

    public function join(Request $request, GroupSession $groupSession): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'pseudonym_bn' => ['required', 'string', 'max:80'],
            'join_code' => ['nullable', 'string', 'max:32'],
        ]);

        try {
            $participant = $this->groupTutoringService->joinCohortRoom(
                session: $groupSession,
                student: $student,
                pseudonymBn: (string) $validated['pseudonym_bn'],
                joinCode: isset($validated['join_code']) ? (string) $validated['join_code'] : null
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'GROUP_COHORT_JOIN_DENIED',
                message: $e->getMessage(),
                status: 409
            );
        }

        return ApiResponse::success(
            data: ['participant' => $participant],
            message: 'গ্রুপ স্টাডি রুমে যুক্ত হয়েছ।',
            status: 201
        );
    }

    public function createBroadcastQuestion(Request $request, GroupSession $groupSession): JsonResponse
    {
        $validated = $request->validate([
            'stem_bn' => ['required', 'string'],
            'options' => ['required', 'array', 'min:2'],
            'correct_option_key' => ['required', 'string', 'max:20'],
            'explanation_bn' => ['required', 'string'],
        ]);

        /** @var array<string, string> $options */
        $options = (array) $validated['options'];

        $question = $this->groupTutoringService->createBroadcastQuestion(
            session: $groupSession,
            stemBn: (string) $validated['stem_bn'],
            options: $options,
            correctOptionKey: (string) $validated['correct_option_key'],
            explanationBn: (string) $validated['explanation_bn']
        );

        return ApiResponse::success(
            data: ['broadcast_question' => $question],
            message: 'গ্রুপ ব্রডকাস্ট প্রশ্ন যৌথ বোর্ডে প্রকাশ করা হয়েছে।',
            status: 201
        );
    }

    public function respondBroadcastQuestion(
        Request $request,
        GroupSession $groupSession,
        GroupBroadcastQuestion $question
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        if ($question->group_session_id !== $groupSession->id) {
            return ApiResponse::error(
                code: 'BROADCAST_QUESTION_MISMATCH',
                message: 'প্রশ্নটি এই গ্রুপ স্টাডি রুমের নয়।',
                status: 422
            );
        }

        $validated = $request->validate([
            'selected_option_key' => ['required', 'string', 'max:20'],
        ]);

        $response = $this->groupTutoringService->submitBroadcastResponse(
            question: $question,
            student: $student,
            selectedOptionKey: (string) $validated['selected_option_key']
        );

        $freshQuestion = $question->fresh() ?? $question;

        return ApiResponse::success(
            data: [
                'response' => [
                    'id' => $response->id,
                    'broadcast_question_id' => $response->broadcast_question_id,
                    'student_id' => $response->student_id,
                    'selected_option_key' => $response->selected_option_key,
                    'is_correct' => $freshQuestion->is_revealed ? $response->is_correct : null,
                ],
                'is_revealed' => $freshQuestion->is_revealed,
                'correct_option_key' => $freshQuestion->is_revealed ? $freshQuestion->correct_option_key : null,
                'explanation_bn' => $freshQuestion->is_revealed ? $freshQuestion->explanation_bn : null,
            ],
            message: 'তোমার একক উত্তর জমা হয়েছে।'
        );
    }

    public function requestIndividualAssistance(Request $request, GroupSession $groupSession): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'student_question_bn' => ['required', 'string', 'max:500'],
        ]);

        try {
            $assistance = $this->groupTutoringService->requestIndividualAssistance(
                session: $groupSession,
                student: $student,
                studentQuestionBn: (string) $validated['student_question_bn']
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'CHILD_SAFETY_BLOCKED',
                message: $e->getMessage(),
                status: 422
            );
        }

        return ApiResponse::success(
            data: ['individual_assistance' => $assistance],
            message: 'যৌথ বোর্ড অপরিবর্তিত রেখে তোমার জন্য একক ব্যাখ্যা প্রদান করা হয়েছে।',
            status: 201
        );
    }

    public function moderateParticipant(
        Request $request,
        GroupSession $groupSession,
        GroupParticipant $participant
    ): JsonResponse {
        if ($participant->group_session_id !== $groupSession->id) {
            return ApiResponse::error(
                code: 'PARTICIPANT_ROOM_MISMATCH',
                message: 'শিক্ষার্থী এই গ্রুপ স্টাডি রুমের সদস্য নয়।',
                status: 422
            );
        }

        $validated = $request->validate([
            'kick' => ['required', 'boolean'],
            'reason_bn' => ['required', 'string', 'max:200'],
        ]);

        $updated = $this->groupTutoringService->moderateParticipant(
            participant: $participant,
            kick: (bool) $validated['kick'],
            reasonBn: (string) $validated['reason_bn']
        );

        return ApiResponse::success(
            data: ['participant' => $updated],
            message: 'শিশু সুরক্ষা মডারেশন সফলভাবে কার্যকর হয়েছে।'
        );
    }
}
