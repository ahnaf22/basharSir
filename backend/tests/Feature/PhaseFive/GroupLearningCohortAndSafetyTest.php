<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('enforces invitation-only cohort join codes, same-class safety, batch broadcast auto-reveal, individual side-assistance, and PII scrubbing in group study rooms', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $objective = LearningObjective::query()->firstOrFail();

    // Student 1 (Class 8)
    $user1 = User::query()->create([
        'name_bn' => 'রাফি আহমেদ',
        'name_en' => 'Rafi Ahmed',
        'phone' => '+8801711880001',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    StudentProfile::query()->create([
        'user_id' => $user1->id,
        'student_code' => 'STU-2026-8101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    // Student 2 (Class 8)
    $user2 = User::query()->create([
        'name_bn' => 'সাদিয়া রহমান',
        'name_en' => 'Sadia Rahman',
        'phone' => '+8801711880002',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    StudentProfile::query()->create([
        'user_id' => $user2->id,
        'student_code' => 'STU-2026-8102',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    // Student 3 (Class 7 - different class level)
    $userClass7 = User::query()->create([
        'name_bn' => 'নাবিল হাসান',
        'name_en' => 'Nabil Hasan',
        'phone' => '+8801711880003',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    StudentProfile::query()->create([
        'user_id' => $userClass7->id,
        'student_code' => 'STU-2026-7103',
        'current_class_level' => 7,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    // 1. Create a Class 8 cohort room with invitation code GRP-8B-2026
    $createRes = $this->actingAs($user1, 'sanctum')
        ->postJson('/api/v1/group-sessions', [
            'learning_objective_id' => $objective->id,
            'title_bn' => 'অষ্টম শ্রেণি গণিত — বীজগণিতীয় সূত্রাবলি যৌথ পাঠ',
            'target_class_level' => 8,
            'target_medium' => 'bangla',
            'min_participants' => 2,
            'max_participants' => 5,
            'join_code' => 'GRP-8B-2026',
        ])
        ->assertCreated();

    $sessionId = (int) $createRes->json('data.group_session.id');
    expect($createRes->json('data.group_session.join_code'))->toBe('GRP-8B-2026');

    // 2. Reject wrong invitation code
    $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/join", [
            'pseudonym_bn' => 'ধ্রুবতারা-১০১',
            'join_code' => 'WRONG-CODE',
        ])
        ->assertStatus(409)
        ->assertJsonPath('error.code', 'GROUP_COHORT_JOIN_DENIED');

    // 3. Reject Class 7 student attempting to join a Class 8 cohort room
    $this->actingAs($userClass7, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/join", [
            'pseudonym_bn' => 'সপ্তম-১০৩',
            'join_code' => 'GRP-8B-2026',
        ])
        ->assertStatus(409)
        ->assertJsonPath('error.code', 'GROUP_COHORT_JOIN_DENIED');

    // 4. Both Class 8 students join with valid invite code
    $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/join", [
            'pseudonym_bn' => 'ধ্রুবতারা-১০১',
            'join_code' => 'GRP-8B-2026',
        ])
        ->assertCreated();

    $join2 = $this->actingAs($user2, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/join", [
            'pseudonym_bn' => 'অনুসন্ধানী-২০৪',
            'join_code' => 'GRP-8B-2026',
        ])
        ->assertCreated();

    $participant2Id = (int) $join2->json('data.participant.id');

    // 5. Batch Mode: Pose a shared group broadcast question
    $qRes = $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/broadcast-questions", [
            'stem_bn' => '$(a + b)^2$-এর বিস্তৃতিতে মধ্যপদ কোনটি?',
            'options' => [
                'A' => '$a^2$',
                'B' => '$2ab$',
                'C' => '$b^2$',
                'D' => '$4ab$',
            ],
            'correct_option_key' => 'B',
            'explanation_bn' => '$(a + b)^2 = a^2 + 2ab + b^2$, তাই মধ্যপদ হলো $2ab$।',
        ])
        ->assertCreated();

    $questionId = (int) $qRes->json('data.broadcast_question.id');

    // Student 1 submits -> not revealed yet because Student 2 hasn't answered
    $resp1 = $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/broadcast-questions/{$questionId}/respond", [
            'selected_option_key' => 'B',
        ])
        ->assertOk();

    expect($resp1->json('data.is_revealed'))->toBeFalse()
        ->and($resp1->json('data.correct_option_key'))->toBeNull();

    // Student 2 submits -> all active participants have responded -> auto-reveals!
    $resp2 = $this->actingAs($user2, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/broadcast-questions/{$questionId}/respond", [
            'selected_option_key' => 'B',
        ])
        ->assertOk();

    expect($resp2->json('data.is_revealed'))->toBeTrue()
        ->and($resp2->json('data.correct_option_key'))->toBe('B');

    // 6. Individual Assistance Mode: side explanation without mutating shared board + PII phone redaction
    $indRes = $this->actingAs($user2, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/individual-assistance", [
            'student_question_bn' => 'স্যার, আমার নাম্বার 01711880002, আমি পক্ষান্তর বিধি বুঝতে পারছি না।',
        ])
        ->assertCreated();

    expect($indRes->json('data.individual_assistance.pii_redacted'))->toBeTrue()
        ->and($indRes->json('data.individual_assistance.student_question_bn'))->toContain('[REDACTED_BD_PHONE]');

    // 7. Raise-Hand with PII scrubbing + Child Safety Moderation
    $handRes = $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/raise-hand", [
            'question_summary_bn' => 'আমার ফোনে 01711880001 কল না দিয়ে বোর্ডে $2ab$ বুঝিয়ে দিন।',
        ])
        ->assertCreated();

    expect($handRes->json('data.raise_hand_event.pii_redacted'))->toBeTrue()
        ->and($handRes->json('data.raise_hand_event.question_summary_bn'))->toContain('[REDACTED_BD_PHONE]');

    // Moderate participant 2
    $modRes = $this->actingAs($user1, 'sanctum')
        ->postJson("/api/v1/group-sessions/{$sessionId}/participants/{$participant2Id}/moderate", [
            'kick' => true,
            'reason_bn' => 'অপ্রাসঙ্গিক বার্তা প্রদান',
        ])
        ->assertOk();

    expect($modRes->json('data.participant.is_kicked'))->toBeTrue();

    // Snapshot check
    $snapshot = $this->actingAs($user2, 'sanctum')
        ->getJson("/api/v1/group-sessions/{$sessionId}")
        ->assertOk();

    expect($snapshot->json('data.active_participants_count'))->toBe(1)
        ->and($snapshot->json('data.broadcast_questions.0.cohort_accuracy_pct'))->toEqual(100)
        ->and($snapshot->json('data.child_safety_policy.direct_messages_enabled'))->toBeFalse();
});
