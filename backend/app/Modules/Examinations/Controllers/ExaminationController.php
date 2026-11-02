<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Models\Exam;
use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\Examinations\Requests\GenerateExamRequest;
use App\Modules\Examinations\Requests\SaveExamAnswersRequest;
use App\Modules\Examinations\Resources\ExamAttemptResource;
use App\Modules\Examinations\Services\ExamGeneratorService;
use App\Modules\Examinations\Services\ExamLifecycleService;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class ExaminationController extends Controller
{
    public function __construct(
        private readonly ExamGeneratorService $examGenerator,
        private readonly ExamLifecycleService $examLifecycle,
    ) {}

    /**
     * POST /api/v1/exams/generate
     */
    public function generateAndStart(GenerateExamRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        /** @var Subject $subject */
        $subject = Subject::query()->findOrFail((int) $request->validated('subject_id'));
        /** @var array<int, int> $chapterIds */
        $chapterIds = array_map('intval', (array) ($request->validated('chapter_ids') ?? []));
        $durationMins = (int) ($request->validated('duration_minutes') ?? 30);

        $exam = $this->examGenerator->generateExam(
            subject: $subject,
            examType: (string) $request->validated('exam_type'),
            titleBn: (string) $request->validated('title_bn'),
            chapterIds: $chapterIds,
            durationMinutes: $durationMins,
            student: $student,
        );

        $attempt = $this->examLifecycle->startAttempt($student, $exam);
        $attempt->load(['exam', 'submittedAnswers.evaluation']);

        return ApiResponse::success(
            data: new ExamAttemptResource($attempt),
            status: 201
        );
    }

    /**
     * GET /api/v1/exam-attempts/{attempt}
     */
    public function showAttempt(ExamAttempt $attempt): JsonResponse
    {
        $attempt->loadMissing(['student', 'exam', 'submittedAnswers.evaluation']);
        Gate::authorize('view', $attempt->student);

        return ApiResponse::success(data: new ExamAttemptResource($attempt));
    }

    /**
     * PUT /api/v1/exam-attempts/{attempt}/answers
     */
    public function saveAnswers(SaveExamAnswersRequest $request, ExamAttempt $attempt): JsonResponse
    {
        $attempt->loadMissing(['student', 'exam']);
        Gate::authorize('update', $attempt->student);

        /** @var array<int, array<string, mixed>> $answers */
        $answers = (array) $request->validated('answers');

        $updated = $this->examLifecycle->autosaveAnswers($attempt, $answers);
        $updated->loadMissing('exam');

        return ApiResponse::success(data: new ExamAttemptResource($updated));
    }

    /**
     * POST /api/v1/exam-attempts/{attempt}/submit
     */
    public function submitAttempt(Request $request, ExamAttempt $attempt): JsonResponse
    {
        $attempt->loadMissing('student');
        Gate::authorize('update', $attempt->student);

        $confidenceOverride = $request->input('simulated_rubric_confidence') !== null
            ? (float) $request->input('simulated_rubric_confidence')
            : null;

        $result = $this->examLifecycle->submitAttempt($attempt, $confidenceOverride);

        return ApiResponse::success(
            data: new ExamAttemptResource($result['attempt']),
            meta: [
                'idempotent_replay' => $result['idempotent_replay'],
            ]
        );
    }

    public function myAttempts(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile ?? StudentProfile::query()->where('user_id', $user->id)->first();
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।', 404);
        }

        $attempts = ExamAttempt::query()
            ->with(['exam.subject', 'submittedAnswers.evaluation'])
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->limit(30)
            ->get();

        return ApiResponse::success(
            data: [
                'attempts' => ExamAttemptResource::collection($attempts)->resolve($request),
            ],
            message: 'পরীক্ষার ইতিহাস সফলভাবে লোড হয়েছে।'
        );
    }
}
