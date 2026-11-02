<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Controllers;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\Evaluation\Services\HandwritingOcrAndGradingService;
use App\Modules\Gamification\Domain\Models\StudentBadge;
use App\Modules\Gamification\Domain\Models\StudentStreak;
use App\Modules\Gamification\Domain\Models\XpLedger;
use App\Modules\Gamification\Services\EthicalGamificationService;
use App\Modules\GroupLearning\Domain\Models\GroupSession;
use App\Modules\GroupLearning\Services\GroupTutoringService;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class PhaseFiveController
{
    public function __construct(
        private readonly HandwritingOcrAndGradingService $ocrGradingService,
        private readonly GroupTutoringService $groupTutoringService,
        private readonly EthicalGamificationService $gamificationService
    ) {}

    public function uploadScript(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'exam_attempt_id' => ['nullable', 'integer', 'exists:exam_attempts,id'],
            'pages_meta' => ['required', 'array', 'min:1'],
            'image_quality_score' => ['required', 'numeric', 'min:0', 'max:1'],
            'orientation_valid' => ['required', 'boolean'],
            'extracted_ocr_text_bn' => ['required', 'string'],
            'ocr_confidence_score' => ['required', 'numeric', 'min:0', 'max:1'],
            'rubric_confidence_score' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        /** @var Question $question */
        $question = Question::query()->with('markingRubric')->findOrFail((int) $validated['question_id']);

        try {
            /** @var array<int, array<string, mixed>> $pagesMeta */
            $pagesMeta = (array) $validated['pages_meta'];
            $script = $this->ocrGradingService->uploadAndEvaluateScript(
                student: $student,
                question: $question,
                pagesMeta: $pagesMeta,
                imageQualityScore: (float) $validated['image_quality_score'],
                orientationValid: (bool) $validated['orientation_valid'],
                extractedOcrTextBn: (string) $validated['extracted_ocr_text_bn'],
                ocrConfidenceScore: (float) $validated['ocr_confidence_score'],
                rubricConfidenceScore: (float) $validated['rubric_confidence_score'],
                examAttemptId: isset($validated['exam_attempt_id']) ? (int) $validated['exam_attempt_id'] : null
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'INVALID_SCRIPT_IMAGE_QUALITY',
                message: $e->getMessage(),
                status: 422
            );
        }

        return ApiResponse::success(
            data: ['script_upload' => $script],
            message: 'হাতের লেখার উত্তরপত্র প্রক্রিয়াকরণ সম্পন্ন হয়েছে।',
            status: 201
        );
    }

    public function overrideScriptReview(Request $request, ScriptUpload $scriptUpload): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'override_marks' => ['required', 'numeric', 'min:0'],
            'corrected_ocr_text_bn' => ['required', 'string'],
            'reviewer_notes_bn' => ['required', 'string'],
        ]);

        $updated = $this->ocrGradingService->applyHumanReviewOverride(
            scriptUpload: $scriptUpload,
            reviewerUserId: $user->id,
            overrideMarks: (float) $validated['override_marks'],
            correctedOcrTextBn: (string) $validated['corrected_ocr_text_bn'],
            reviewerNotesBn: (string) $validated['reviewer_notes_bn']
        );

        return ApiResponse::success(
            data: ['script_upload' => $updated],
            message: 'মানব পরীক্ষকের সংশোধিত মূল্যায়ন সংরক্ষিত হয়েছে।'
        );
    }

    public function joinGroupSession(Request $request, GroupSession $groupSession): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'pseudonym_bn' => ['required', 'string', 'max:80'],
        ]);

        try {
            $participant = $this->groupTutoringService->joinCohortRoom(
                session: $groupSession,
                student: $student,
                pseudonymBn: (string) $validated['pseudonym_bn']
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'GROUP_COHORT_FULL',
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

    public function raiseHand(Request $request, GroupSession $groupSession): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'question_summary_bn' => ['required', 'string', 'max:300'],
        ]);

        $event = $this->groupTutoringService->enqueueRaiseHand(
            session: $groupSession,
            student: $student,
            questionSummaryBn: (string) $validated['question_summary_bn']
        );

        return ApiResponse::success(
            data: ['raise_hand_event' => $event],
            message: 'তোমার প্রশ্নটি কিউতে যুক্ত হয়েছে।',
            status: 201
        );
    }

    public function resolveNextRaiseHand(Request $request, GroupSession $groupSession): JsonResponse
    {
        $validated = $request->validate([
            'response_bn' => ['required', 'string'],
        ]);

        $resolved = $this->groupTutoringService->resolveNextInQueue(
            session: $groupSession,
            responseBn: (string) $validated['response_bn']
        );

        return ApiResponse::success(
            data: ['resolved_event' => $resolved],
            message: 'পরবর্তী প্রশ্নের উত্তর প্রদান করা হয়েছে।'
        );
    }

    public function recordGamificationEvent(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'source_type' => ['required', 'string', 'max:50'],
            'source_id' => ['required', 'integer'],
            'xp_points' => ['required', 'integer', 'min:1', 'max:500'],
            'reason_bn' => ['required', 'string', 'max:200'],
            'activity_date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $summary = $this->gamificationService->recordVerifiedAcademicActivity(
            student: $student,
            sourceType: (string) $validated['source_type'],
            sourceId: (int) $validated['source_id'],
            xpPoints: (int) $validated['xp_points'],
            reasonBn: (string) $validated['reason_bn'],
            activityDate: isset($validated['activity_date']) ? (string) $validated['activity_date'] : null
        );

        return ApiResponse::success(
            data: $summary,
            message: 'এক্সপি ও স্ট্রিক হালনাগাদ হয়েছে।'
        );
    }

    public function cohortLeaderboard(Request $request): JsonResponse
    {
        $classLevel = (int) $request->query('class_level', '8');

        return ApiResponse::success(
            data: [
                'class_level' => $classLevel,
                'leaderboard' => $this->gamificationService->getCohortLeaderboard($classLevel),
            ],
            message: 'শ্রেণিভিত্তিক লিডারবোর্ড লোড হয়েছে।'
        );
    }

    public function myGamification(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile ?? StudentProfile::query()->where('user_id', $user->id)->first();
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।', 404);
        }

        $streak = StudentStreak::query()->where('student_id', $student->id)->first();
        $totalXp = (int) XpLedger::query()->where('student_id', $student->id)->sum('xp_points');
        $badges = StudentBadge::query()->where('student_id', $student->id)->orderByDesc('awarded_at')->get();
        $recentXp = XpLedger::query()
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        return ApiResponse::success(
            data: [
                'total_xp' => $totalXp,
                'streak' => [
                    'current_days' => $streak !== null ? $streak->current_streak_days : 0,
                    'longest_days' => $streak !== null ? $streak->longest_streak_days : 0,
                    'freezes_available' => $streak !== null ? $streak->streak_freezes_available : 1,
                    'last_active_date' => $streak?->last_active_date?->format('Y-m-d'),
                ],
                'badges' => $badges,
                'recent_xp' => $recentXp,
            ],
            message: 'গেমিফিকেশন ও এক্সপি তথ্য লোড হয়েছে।'
        );
    }
}
