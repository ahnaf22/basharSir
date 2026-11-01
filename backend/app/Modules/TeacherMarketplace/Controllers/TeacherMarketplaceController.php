<?php

declare(strict_types=1);

namespace App\Modules\TeacherMarketplace\Controllers;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\TeacherMarketplace\Domain\Models\ScriptReviewAssignment;
use App\Modules\TeacherMarketplace\Domain\Models\TeacherProfile;
use App\Modules\TeacherMarketplace\Services\TeacherMarketplaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class TeacherMarketplaceController
{
    public function __construct(
        private readonly TeacherMarketplaceService $marketplaceService
    ) {}

    public function listVerifiedTeachers(): JsonResponse
    {
        $teachers = TeacherProfile::query()
            ->where('vetting_status', 'verified')
            ->orderBy('hourly_rate_bdt')
            ->get();

        return ApiResponse::success(
            data: ['teachers' => $teachers],
            message: 'যাচাইকৃত শিক্ষকদের তালিকা লোড হয়েছে।'
        );
    }

    public function registerTeacherProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'full_name_bn' => ['required', 'string', 'max:150'],
            'full_name_en' => ['required', 'string', 'max:150'],
            'university_and_degree_bn' => ['required', 'string', 'max:250'],
            'specializations' => ['required', 'array', 'min:1'],
            'hourly_rate_bdt' => ['required', 'integer', 'min:100', 'max:5000'],
        ]);

        $profile = TeacherProfile::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'teacher_code' => 'TCH-2026-'.str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
                'full_name_bn' => (string) $validated['full_name_bn'],
                'full_name_en' => (string) $validated['full_name_en'],
                'university_and_degree_bn' => (string) $validated['university_and_degree_bn'],
                'specializations_json' => (array) $validated['specializations'],
                'hourly_rate_bdt' => (int) $validated['hourly_rate_bdt'],
                'vetting_status' => 'pending_review',
            ]
        );

        return ApiResponse::success(
            data: ['teacher' => $profile],
            message: 'শিক্ষক প্রোফাইল যাচাইয়ের জন্য জমা হয়েছে।',
            status: 201
        );
    }

    public function verifyTeacherVetting(TeacherProfile $teacher): JsonResponse
    {
        $verified = $this->marketplaceService->verifyTeacher($teacher);

        return ApiResponse::success(
            data: ['teacher' => $verified],
            message: 'শিক্ষকের প্রোফাইল যাচাই (Verified) সম্পন্ন হয়েছে।'
        );
    }

    public function bookSession(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var GuardianProfile $guardian */
        $guardian = GuardianProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'teacher_id' => ['required', 'integer', 'exists:teacher_profiles,id'],
            'student_code' => ['required', 'string', 'exists:student_profiles,student_code'],
            'learning_objective_id' => ['required', 'integer', 'exists:learning_objectives,id'],
            'session_mode' => ['required', 'string', 'in:one_on_one,small_batch'],
            'scheduled_at' => ['required', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:30', 'max:180'],
        ]);

        /** @var TeacherProfile $teacher */
        $teacher = TeacherProfile::query()->findOrFail((int) $validated['teacher_id']);
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('student_code', (string) $validated['student_code'])->firstOrFail();
        /** @var LearningObjective $objective */
        $objective = LearningObjective::query()->findOrFail((int) $validated['learning_objective_id']);

        try {
            $booking = $this->marketplaceService->bookLiveTeacherSession(
                teacher: $teacher,
                guardian: $guardian,
                student: $student,
                objective: $objective,
                sessionMode: (string) $validated['session_mode'],
                scheduledAtIso: (string) $validated['scheduled_at'],
                durationMinutes: (int) $validated['duration_minutes']
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'UNVERIFIED_TEACHER_BOOKING_BLOCKED',
                message: $e->getMessage(),
                status: 422
            );
        }

        return ApiResponse::success(
            data: ['booking' => $booking],
            message: 'লাইভ শিক্ষক সেশন বুকিং ও এআই ডায়াগনস্টিক ব্রিফ তৈরি হয়েছে।',
            status: 201
        );
    }

    public function assignScriptReview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'script_upload_id' => ['required', 'integer', 'exists:script_uploads,id'],
            'teacher_id' => ['required', 'integer', 'exists:teacher_profiles,id'],
            'reward_bdt' => ['nullable', 'integer', 'min:20', 'max:500'],
        ]);

        /** @var ScriptUpload $script */
        $script = ScriptUpload::query()->findOrFail((int) $validated['script_upload_id']);
        /** @var TeacherProfile $teacher */
        $teacher = TeacherProfile::query()->findOrFail((int) $validated['teacher_id']);

        $assignment = $this->marketplaceService->assignEscalatedScriptToTeacher(
            scriptUpload: $script,
            teacher: $teacher,
            rewardBdt: isset($validated['reward_bdt']) ? (int) $validated['reward_bdt'] : 50
        );

        return ApiResponse::success(
            data: ['assignment' => $assignment],
            message: 'উত্তরপত্রটি যাচাইকৃত শিক্ষকের নিকট অ্যাসাইন করা হয়েছে।',
            status: 201
        );
    }

    public function completeScriptReview(Request $request, ScriptReviewAssignment $assignment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'override_marks' => ['required', 'numeric', 'min:0'],
            'corrected_ocr_text_bn' => ['required', 'string'],
            'reviewer_notes_bn' => ['required', 'string'],
        ]);

        $result = $this->marketplaceService->completeTeacherScriptReview(
            assignment: $assignment,
            reviewerUserId: $user->id,
            overrideMarks: (float) $validated['override_marks'],
            correctedOcrTextBn: (string) $validated['corrected_ocr_text_bn'],
            reviewerNotesBn: (string) $validated['reviewer_notes_bn']
        );

        return ApiResponse::success(
            data: $result,
            message: 'মানব শিক্ষকের উত্তরপত্র মূল্যায়ন সম্পন্ন হয়েছে।'
        );
    }

    public function listClassesOneToTen(): JsonResponse
    {
        $classes = AcademicClass::query()
            ->with('subjects')
            ->orderBy('grade_level')
            ->get();

        return ApiResponse::success(
            data: [
                'total_classes' => $classes->count(),
                'classes' => $classes,
            ],
            message: '১ম থেকে ১০ম শ্রেণি (Primary, Lower Secondary & SSC) পাঠ্যক্রম লোড হয়েছে।'
        );
    }
}
