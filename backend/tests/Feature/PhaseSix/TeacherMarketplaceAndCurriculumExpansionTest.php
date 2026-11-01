<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbClassOneToTenExpansionSeeder;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbQuestionBankSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('onboards and vets human teachers, generates AI diagnostic brief on booking with 80/20 escrow split, completes SLA script review, and expands NCTB curriculum across Classes 1 to 10', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbClassOneToTenExpansionSeeder::class);
    $this->seed(NctbQuestionBankSeeder::class);

    $teacherUser = User::query()->create([
        'name_bn' => 'ড. মাহবুবুর রহমান',
        'name_en' => 'Dr. Mahbubur Rahman',
        'phone' => '+8801711770011',
        'account_type' => 'guardian',
        'status' => 'active',
    ]);

    $guardianUser = User::query()->create([
        'name_bn' => 'রফিকুল ইসলাম',
        'name_en' => 'Rafiqul Islam',
        'phone' => '+8801711770022',
        'account_type' => 'guardian',
        'status' => 'active',
    ]);

    GuardianProfile::query()->create([
        'user_id' => $guardianUser->id,
        'relation_type' => 'father',
        'preferred_language' => 'bn',
    ]);

    $studentUser = User::query()->create([
        'name_bn' => 'সাদিয়া ইসলাম',
        'name_en' => 'Sadia Islam',
        'phone' => '+8801711770033',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STU-2026-6001',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $objective = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();
    $curriculumVersionId = $objective->topic->chapter->subject->academicClass->curriculum_version_id;

    MasteryRecord::query()->create([
        'student_id' => $student->id,
        'curriculum_version_id' => $curriculumVersionId,
        'learning_objective_id' => $objective->id,
        'mastery_score' => '44.00',
        'mastery_status' => 'practicing',
        'attempts_count' => 2,
        'correct_count' => 1,
    ]);

    $teacherToken = $teacherUser->createToken('teacher-user')->plainTextToken;
    $guardianToken = $guardianUser->createToken('guardian-user')->plainTextToken;

    // 1. Register Human Teacher Profile (Chunk 6.1)
    $regRes = $this->withHeader('Authorization', "Bearer {$teacherToken}")
        ->postJson('/api/v1/teachers/register', [
            'full_name_bn' => 'ড. মাহবুবুর রহমান',
            'full_name_en' => 'Dr. Mahbubur Rahman',
            'university_and_degree_bn' => 'গণিত বিভাগ, ঢাকা বিশ্ববিদ্যালয় (M.Sc)',
            'specializations' => ['Class 8 Mathematics', 'SSC Higher Math'],
            'hourly_rate_bdt' => 600,
        ])
        ->assertCreated();

    $teacherId = (int) $regRes->json('data.teacher.id');
    expect($regRes->json('data.teacher.vetting_status'))->toBe('pending_review');

    // Attempt to book before vetting -> 422 UNVERIFIED_TEACHER_BOOKING_BLOCKED
    Auth::forgetGuards();
    $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson('/api/v1/teacher-bookings', [
            'teacher_id' => $teacherId,
            'student_code' => $student->student_code,
            'learning_objective_id' => $objective->id,
            'session_mode' => 'one_on_one',
            'scheduled_at' => '2026-11-05T16:00:00Z',
            'duration_minutes' => 60,
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'UNVERIFIED_TEACHER_BOOKING_BLOCKED');

    // Verify Teacher Vetting
    $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson("/api/v1/teachers/{$teacherId}/verify")
        ->assertOk()
        ->assertJsonPath('data.teacher.vetting_status', 'verified');

    // 2. Book 1-on-1 Live Teacher Session + AI Student Diagnostic Brief Hand-Off (Chunk 6.2)
    $bookRes = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson('/api/v1/teacher-bookings', [
            'teacher_id' => $teacherId,
            'student_code' => $student->student_code,
            'learning_objective_id' => $objective->id,
            'session_mode' => 'one_on_one',
            'scheduled_at' => '2026-11-05T16:00:00Z',
            'duration_minutes' => 60,
        ])
        ->assertCreated();

    expect($bookRes->json('data.booking.agreed_fee_bdt'))->toBe(600)
        ->and($bookRes->json('data.booking.platform_commission_bdt'))->toBe(120)
        ->and($bookRes->json('data.booking.teacher_payout_bdt'))->toBe(480)
        ->and((float) $bookRes->json('data.booking.ai_diagnostic_brief_json.current_mastery_score'))->toBe(44.0);

    // 3. Hybrid Human Script Review Marketplace (Chunk 6.3)
    $question = Question::query()->where('question_type', 'creative_srijonshil')->firstOrFail();
    $script = ScriptUpload::query()->create([
        'uuid' => (string) Str::uuid(),
        'student_id' => $student->id,
        'question_id' => $question->id,
        'page_count' => 1,
        'pages_meta_json' => [['page' => 1]],
        'image_quality_score' => 0.90,
        'orientation_valid' => true,
        'ocr_text_bn' => 'অস্পষ্ট সৃজনশীল উত্তর',
        'ocr_confidence_score' => 0.75,
        'rubric_confidence_score' => 0.82,
        'awarded_marks' => 5.0,
        'max_marks' => 10.0,
        'status' => 'escalated_to_human',
    ]);

    $assignRes = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson('/api/v1/script-review-assignments', [
            'script_upload_id' => $script->id,
            'teacher_id' => $teacherId,
            'reward_bdt' => 60,
        ])
        ->assertCreated();

    $assignmentId = (int) $assignRes->json('data.assignment.id');

    Auth::forgetGuards();
    $completeRes = $this->withHeader('Authorization', "Bearer {$teacherToken}")
        ->postJson("/api/v1/script-review-assignments/{$assignmentId}/complete", [
            'override_marks' => 9.0,
            'corrected_ocr_text_bn' => 'সংশোধিত পূর্ণাঙ্গ সৃজনশীল সমাধান',
            'reviewer_notes_bn' => 'সকল ধাপ যথাযথভাবে সম্পন্ন করেছে।',
        ])
        ->assertOk();

    expect($completeRes->json('data.assignment.status'))->toBe('completed')
        ->and($completeRes->json('data.script_upload.status'))->toBe('human_reviewed')
        ->and((float) $completeRes->json('data.script_upload.awarded_marks'))->toBe(9.0);

    // 4. NCTB Class 1–10 Expansion Verification (Chunk 6.4)
    $classesRes = $this->withHeader('Authorization', "Bearer {$teacherToken}")
        ->getJson('/api/v1/curriculum/classes-1-to-10')
        ->assertOk();

    expect($classesRes->json('data.total_classes'))->toBe(10);
});
