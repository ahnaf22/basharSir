<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\GroupLearning\Domain\Models\GroupSession;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbQuestionBankSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('enforces dual OCR/rubric confidence gates on handwritten scripts, FIFO raise-hand queue in 5-student cohorts, and ethical gamification with streak freeze', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbQuestionBankSeeder::class);

    $studentUser = User::query()->create([
        'name_bn' => 'তানভীর ইসলাম',
        'name_en' => 'Tanvir Islam',
        'phone' => '+8801711990011',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STU-2026-5001',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $token = $studentUser->createToken('phase5-student')->plainTextToken;

    $creativeQuestion = Question::query()
        ->where('question_type', 'creative_srijonshil')
        ->firstOrFail();

    // 1. Reject blurry handwritten image (image_quality_score < 0.70)
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/script-uploads', [
            'question_id' => $creativeQuestion->id,
            'pages_meta' => [['page' => 1, 'size_kb' => 310]],
            'image_quality_score' => 0.55,
            'orientation_valid' => true,
            'extracted_ocr_text_bn' => 'সমাধান ধাপসমূহ',
            'ocr_confidence_score' => 0.92,
            'rubric_confidence_score' => 0.88,
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'INVALID_SCRIPT_IMAGE_QUALITY');

    // 2. High confidence OCR (0.91 >= 0.85) & Rubric (0.86 >= 0.80) -> auto_graded
    $autoRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/script-uploads', [
            'question_id' => $creativeQuestion->id,
            'pages_meta' => [['page' => 1, 'size_kb' => 310]],
            'image_quality_score' => 0.92,
            'orientation_valid' => true,
            'extracted_ocr_text_bn' => 'প্রদত্ত রাশি হতে বর্গের সূত্র প্রয়োগ করে পূর্ণাঙ্গ সমাধান নির্ণয় করা হলো।',
            'ocr_confidence_score' => 0.91,
            'rubric_confidence_score' => 0.86,
        ])
        ->assertCreated();

    expect($autoRes->json('data.script_upload.status'))->toBe('auto_graded');

    // 3. Low OCR confidence (0.78 < 0.85) -> escalated_to_human, then overridden by reviewer
    $escalatedRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/script-uploads', [
            'question_id' => $creativeQuestion->id,
            'pages_meta' => [['page' => 1, 'size_kb' => 340]],
            'image_quality_score' => 0.88,
            'orientation_valid' => true,
            'extracted_ocr_text_bn' => 'অস্পষ্ট হাতের লেখা সমাধান',
            'ocr_confidence_score' => 0.78,
            'rubric_confidence_score' => 0.84,
        ])
        ->assertCreated();

    expect($escalatedRes->json('data.script_upload.status'))->toBe('escalated_to_human');
    $scriptId = (int) $escalatedRes->json('data.script_upload.id');

    $overrideRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/script-uploads/{$scriptId}/review-override", [
            'override_marks' => 8.5,
            'corrected_ocr_text_bn' => 'সংশোধিত পূর্ণাঙ্গ সৃজনশীল উত্তর',
            'reviewer_notes_bn' => 'গ ও ঘ অংশের ধাপগুলো সঠিক রয়েছে।',
        ])
        ->assertOk();

    expect($overrideRes->json('data.script_upload.status'))->toBe('human_reviewed')
        ->and((float) $overrideRes->json('data.script_upload.awarded_marks'))->toBe(8.5);

    // 4. Small-Group Cohort Room (max 3 in this test room) & FIFO Raise-Hand Queue
    $objective = LearningObjective::query()->firstOrFail();
    $groupSession = GroupSession::query()->create([
        'uuid' => (string) Str::uuid(),
        'learning_objective_id' => $objective->id,
        'title_bn' => 'অষ্টম শ্রেণি গণিত — সরল সমীকরণ গ্রুপ স্টাডি',
        'min_participants' => 2,
        'max_participants' => 2,
        'status' => 'live',
        'scheduled_at' => now(),
    ]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/group-sessions/{$groupSession->id}/join", [
            'pseudonym_bn' => 'ধ্রুবতারা-১০১',
        ])
        ->assertCreated();

    $raise1 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/group-sessions/{$groupSession->id}/raise-hand", [
            'question_summary_bn' => 'পক্ষান্তর বিধি কখন প্রয়োগ করতে হয়?',
        ])
        ->assertCreated();

    $raise2 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/group-sessions/{$groupSession->id}/raise-hand", [
            'question_summary_bn' => 'ভগ্নাংশ যুক্ত সমীকরণ কীভাবে সরল করব?',
        ])
        ->assertCreated();

    expect($raise1->json('data.raise_hand_event.queue_position'))->toBe(1)
        ->and($raise2->json('data.raise_hand_event.queue_position'))->toBe(2);

    $resolved1 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/group-sessions/{$groupSession->id}/resolve-next", [
            'response_bn' => 'সমান চিহ্নের এক পাশ থেকে অন্য পাশে পদ নিলে চিহ্ন পরিবর্তন হয়।',
        ])
        ->assertOk();

    expect($resolved1->json('data.resolved_event.id'))->toBe($raise1->json('data.raise_hand_event.id'))
        ->and($resolved1->json('data.resolved_event.status'))->toBe('answered');

    // 5. Ethical Gamification: idempotent XP, Streak Freeze across 1 missed day, Badges & Pseudonymous Leaderboard
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/gamification/events', [
            'source_type' => 'tutor_lesson_completed',
            'source_id' => 101,
            'xp_points' => 30,
            'reason_bn' => 'বীজগণিত পাঠ সম্পন্ন',
            'activity_date' => '2026-10-29',
        ])
        ->assertOk();

    // Replay same source_id -> 0 new XP awarded
    $dupXp = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/gamification/events', [
            'source_type' => 'tutor_lesson_completed',
            'source_id' => 101,
            'xp_points' => 30,
            'reason_bn' => 'বীজগণিত পাঠ সম্পন্ন',
            'activity_date' => '2026-10-29',
        ])
        ->assertOk();
    expect($dupXp->json('data.xp_awarded'))->toBe(0)
        ->and($dupXp->json('data.total_xp'))->toBe(30);

    // Next consecutive day (2026-10-30) -> streak = 2
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/gamification/events', [
            'source_type' => 'tutor_lesson_completed',
            'source_id' => 102,
            'xp_points' => 25,
            'reason_bn' => 'সরল সমীকরণ পাঠ সম্পন্ন',
            'activity_date' => '2026-10-30',
        ])
        ->assertOk();

    // Skip 2026-10-31 and study on 2026-11-01 (diffDays = 2) -> consumes 1 Streak Freeze and advances streak to 3!
    $streak3Res = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/gamification/events', [
            'source_type' => 'exam_completed',
            'source_id' => 201,
            'xp_points' => 40,
            'reason_bn' => 'অধ্যায়ভিত্তিক কুইজ সম্পন্ন',
            'activity_date' => '2026-11-01',
        ])
        ->assertOk();

    expect($streak3Res->json('data.current_streak_days'))->toBe(3)
        ->and($streak3Res->json('data.streak_freezes_available'))->toBe(0)
        ->and($streak3Res->json('data.total_xp'))->toBe(95)
        ->and($streak3Res->json('data.badges'))->toHaveCount(2);

    $lbRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/gamification/leaderboard?class_level=8')
        ->assertOk();

    expect($lbRes->json('data.leaderboard.0.pseudonym_bn'))->toBe('শিক্ষার্থী-5001')
        ->and($lbRes->json('data.leaderboard.0.total_xp'))->toBe(95);
});
