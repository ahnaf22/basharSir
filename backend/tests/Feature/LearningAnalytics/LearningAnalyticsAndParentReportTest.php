<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

it('computes 5-tier student performance analytics, detects weak objectives, and generates guardian weekly PDF reports with ownership isolation', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $studentUser = User::query()->create([
        'name_bn' => 'ফারহান সাদিক',
        'name_en' => 'Farhan Sadik',
        'phone' => '+8801711002233',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STD-2026-700101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
        'daily_study_target_mins' => 60,
    ]);

    $guardianUser = User::query()->create([
        'name_bn' => 'কামরুল হাসান',
        'name_en' => 'Kamrul Hasan',
        'phone' => '+8801811002233',
        'account_type' => 'guardian',
        'status' => 'active',
    ]);

    $guardian = GuardianProfile::query()->create([
        'user_id' => $guardianUser->id,
        'relation_type' => 'father',
        'preferred_language' => 'bn',
    ]);

    StudentGuardianLink::query()->create([
        'student_id' => $student->id,
        'guardian_id' => $guardian->id,
        'is_primary_payer' => true,
        'status' => 'verified',
        'verified_at' => now(),
    ]);

    $unlinkedGuardianUser = User::query()->create([
        'name_bn' => 'অন্য অভিভাবক',
        'name_en' => 'Unlinked Guardian',
        'phone' => '+8801911002233',
        'account_type' => 'guardian',
        'status' => 'active',
    ]);
    GuardianProfile::query()->create([
        'user_id' => $unlinkedGuardianUser->id,
        'relation_type' => 'mother',
        'preferred_language' => 'bn',
    ]);

    $lo1 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();
    $lo2 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO2')->firstOrFail();
    $curriculumVersionId = $lo1->topic->chapter->subject->academicClass->curriculum_version_id;

    // Seed one struggling objective (32%) and one proficient objective (84%)
    MasteryRecord::query()->create([
        'student_id' => $student->id,
        'curriculum_version_id' => $curriculumVersionId,
        'learning_objective_id' => $lo1->id,
        'mastery_score' => '32.00',
        'mastery_status' => 'struggling',
        'attempts_count' => 3,
        'correct_count' => 1,
    ]);

    MasteryRecord::query()->create([
        'student_id' => $student->id,
        'curriculum_version_id' => $curriculumVersionId,
        'learning_objective_id' => $lo2->id,
        'mastery_score' => '84.00',
        'mastery_status' => 'proficient',
        'attempts_count' => 4,
        'correct_count' => 4,
    ]);

    StudyTimeLog::query()->create([
        'student_id' => $student->id,
        'study_date' => now()->toDateString(),
        'subject_id' => $lo1->topic->chapter->subject_id,
        'source_type' => 'tutor_session',
        'source_id' => 1,
        'session_start_at' => now()->subMinutes(45),
        'last_heartbeat_at' => now(),
        'session_end_at' => now(),
        'active_seconds' => 2400,
        'paused_seconds' => 120,
        'questions_attempted' => 6,
    ]);

    $studentToken = $studentUser->createToken('student-analytics')->plainTextToken;

    // 1. Student fetches their own 5-tier analytics
    $res = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/analytics/me')
        ->assertOk();

    expect($res->json('data.tier_1_snapshot.overall_mastery_percentage'))->toEqual(58.0)
        ->and($res->json('data.tier_1_snapshot.active_study_minutes_last_7_days'))->toBe(40)
        ->and($res->json('data.tier_2_subject_matrix'))->toHaveCount(1)
        ->and($res->json('data.tier_3_weaknesses'))->toHaveCount(1)
        ->and($res->json('data.tier_3_weaknesses.0.objective_code'))->toBe('C8-MATH-CH4-T1-LO1')
        ->and($res->json('data.tier_4_recommendations_bn.0.priority'))->toBe('high')
        ->and($res->json('data.tier_5_weekly_trend'))->toHaveCount(7);

    // 2. Verified linked guardian fetches child's weekly report & PDF
    Auth::forgetGuards();
    $guardianToken = $guardianUser->createToken('guardian-report')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->getJson("/api/v1/guardians/children/{$student->student_code}/weekly-report")
        ->assertOk()
        ->assertJsonPath('data.student.student_code', 'STD-2026-700101');

    $pdfRes = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->get("/api/v1/guardians/children/{$student->student_code}/weekly-report/pdf")
        ->assertOk();

    expect($pdfRes->headers->get('Content-Type'))->toContain('application/pdf')
        ->and($pdfRes->getContent())->toStartWith('%PDF-1.4');

    // 3. Unlinked guardian is strictly blocked (403 Forbidden)
    Auth::forgetGuards();
    $unlinkedToken = $unlinkedGuardianUser->createToken('unlinked-guardian')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$unlinkedToken}")
        ->getJson("/api/v1/guardians/children/{$student->student_code}/weekly-report")
        ->assertForbidden();
});
