<?php

declare(strict_types=1);

namespace App\Modules\TeacherMarketplace\Services;

use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\Evaluation\Services\HandwritingOcrAndGradingService;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\TeacherMarketplace\Domain\Models\ScriptReviewAssignment;
use App\Modules\TeacherMarketplace\Domain\Models\TeacherBooking;
use App\Modules\TeacherMarketplace\Domain\Models\TeacherProfile;
use App\Modules\Tutoring\Models\TutorMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class TeacherMarketplaceService
{
    public function __construct(
        private readonly HandwritingOcrAndGradingService $ocrGradingService
    ) {}

    public function verifyTeacher(TeacherProfile $teacher): TeacherProfile
    {
        $teacher->update([
            'vetting_status' => 'verified',
            'verified_at' => Carbon::now(),
        ]);

        return $teacher->fresh() ?? $teacher;
    }

    /**
     * Generates a pre-session AI Student Diagnostic Brief so the human teacher
     * knows the student's current mastery, recent misconceptions, and target objective.
     *
     * @return array<string, mixed>
     */
    public function buildAiDiagnosticBrief(StudentProfile $student, LearningObjective $objective): array
    {
        $mastery = MasteryRecord::query()
            ->where('student_id', $student->id)
            ->where('learning_objective_id', $objective->id)
            ->first();

        $recentMisconceptions = TutorMessage::query()
            ->whereHas('session', fn ($q) => $q->where('student_id', $student->id))
            ->whereNotNull('misconception_code')
            ->orderByDesc('id')
            ->limit(5)
            ->pluck('misconception_code')
            ->unique()
            ->values()
            ->all();

        $masteryScore = $mastery !== null ? round((float) $mastery->mastery_score, 2) : 0.0;
        $masteryStatus = $mastery !== null ? (string) $mastery->mastery_status : 'not_started';

        return [
            'student_code' => $student->student_code,
            'learning_objective_code' => $objective->code,
            'learning_objective_title_bn' => $objective->title_bn,
            'current_mastery_score' => $masteryScore,
            'current_mastery_status' => $masteryStatus,
            'recent_misconceptions' => $recentMisconceptions,
            'teacher_focus_recommendation_bn' => $masteryScore < 60.0
                ? "শিক্ষার্থী '{$objective->title_bn}' অংশে দুর্বল ({$masteryScore}%)। মৌলিক ধারণা ও উদাহরণ দিয়ে সেশন শুরু করুন।"
                : "শিক্ষার্থীর মৌলিক ধারণা স্পষ্ট ({$masteryScore}%)। সৃজনশীল ও উচ্চতর দক্ষতার সমস্যার সমাধান অনুশীলন করান।",
        ];
    }

    public function bookLiveTeacherSession(
        TeacherProfile $teacher,
        GuardianProfile $guardian,
        StudentProfile $student,
        LearningObjective $objective,
        string $sessionMode,
        string $scheduledAtIso,
        int $durationMinutes
    ): TeacherBooking {
        if ($teacher->vetting_status !== 'verified') {
            throw new InvalidArgumentException('শুধুমাত্র যাচাইকৃত (Verified) শিক্ষকের সেশন বুক করা যাবে।');
        }

        return DB::transaction(function () use (
            $teacher,
            $guardian,
            $student,
            $objective,
            $sessionMode,
            $scheduledAtIso,
            $durationMinutes
        ): TeacherBooking {
            $agreedFee = (int) round(($teacher->hourly_rate_bdt * $durationMinutes) / 60);
            $commission = (int) round($agreedFee * 0.20);
            $payout = $agreedFee - $commission;

            $diagnosticBrief = $this->buildAiDiagnosticBrief($student, $objective);

            return TeacherBooking::query()->create([
                'uuid' => (string) Str::uuid(),
                'teacher_id' => $teacher->id,
                'guardian_id' => $guardian->id,
                'student_id' => $student->id,
                'learning_objective_id' => $objective->id,
                'session_mode' => $sessionMode,
                'scheduled_at' => Carbon::parse($scheduledAtIso),
                'duration_minutes' => $durationMinutes,
                'agreed_fee_bdt' => $agreedFee,
                'platform_commission_bdt' => $commission,
                'teacher_payout_bdt' => $payout,
                'escrow_status' => 'held_in_escrow',
                'ai_diagnostic_brief_json' => $diagnosticBrief,
                'status' => 'booked',
            ]);
        });
    }

    public function assignEscalatedScriptToTeacher(
        ScriptUpload $scriptUpload,
        TeacherProfile $teacher,
        int $rewardBdt = 50
    ): ScriptReviewAssignment {
        if ($teacher->vetting_status !== 'verified') {
            throw new InvalidArgumentException('শুধুমাত্র যাচাইকৃত শিক্ষক উত্তরপত্র মূল্যায়ন করতে পারবেন।');
        }

        return ScriptReviewAssignment::query()->updateOrCreate(
            ['script_upload_id' => $scriptUpload->id],
            [
                'teacher_id' => $teacher->id,
                'reward_bdt' => $rewardBdt,
                'sla_due_at' => Carbon::now()->addHours(24),
                'status' => 'assigned',
            ]
        );
    }

    /**
     * @return array{
     *   assignment: ScriptReviewAssignment,
     *   script_upload: ScriptUpload
     * }
     */
    public function completeTeacherScriptReview(
        ScriptReviewAssignment $assignment,
        int $reviewerUserId,
        float $overrideMarks,
        string $correctedOcrTextBn,
        string $reviewerNotesBn
    ): array {
        return DB::transaction(function () use (
            $assignment,
            $reviewerUserId,
            $overrideMarks,
            $correctedOcrTextBn,
            $reviewerNotesBn
        ): array {
            /** @var ScriptUpload $script */
            $script = ScriptUpload::query()->findOrFail($assignment->script_upload_id);

            $updatedScript = $this->ocrGradingService->applyHumanReviewOverride(
                scriptUpload: $script,
                reviewerUserId: $reviewerUserId,
                overrideMarks: $overrideMarks,
                correctedOcrTextBn: $correctedOcrTextBn,
                reviewerNotesBn: $reviewerNotesBn
            );

            $assignment->update([
                'status' => 'completed',
                'completed_at' => Carbon::now(),
            ]);

            return [
                'assignment' => $assignment->fresh() ?? $assignment,
                'script_upload' => $updatedScript,
            ];
        });
    }
}
