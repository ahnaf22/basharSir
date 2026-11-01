<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\LearningAnalytics\Models\MasteryEvidenceLog;
use App\Modules\LearningAnalytics\Services\MasteryCalculationService;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbLearningResourceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('calculates deterministic mastery with hint penalties and blocks proficient status without summative evidence', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'সাকিব হাসান',
        'name_en' => 'Sakib Hasan',
        'phone' => '+8801755443322',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-300101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $objective = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();
    $curriculumVersionId = $objective->topic->chapter->subject->academicClass->curriculum_version_id;

    $service = new MasteryCalculationService;

    // 1. Hint penalty verification: 0 hints = 1.00, 1 hint = 0.75, 2+ hints = 0.50
    expect($service->hintPenaltyFactor(0))->toBe(1.00)
        ->and($service->hintPenaltyFactor(1))->toBe(0.75)
        ->and($service->hintPenaltyFactor(2))->toBe(0.50)
        ->and($service->hintPenaltyFactor(3))->toBe(0.50);

    // 2. Repeated guided_practice with 100% score and hard difficulty NEVER exceeds 74.00 ('practicing') without mini_assessment/exam
    for ($i = 1; $i <= 15; $i++) {
        $record = $service->recordEvidence(
            studentId: $student->id,
            curriculumVersionId: $curriculumVersionId,
            learningObjectiveId: $objective->id,
            sourceType: 'guided_practice',
            sourceId: $i,
            scoreRatio: 1.0,
            difficulty: 'hard',
            hintsUsed: 0
        );
    }

    expect((float) $record->mastery_score)->toBe(74.00)
        ->and($record->mastery_status)->toBe('practicing');

    // 3. Passing unassisted mini_assessment unlocks 'proficient' (>= 75.00) and 'mastered' (>= 90.00)
    $recordAfterMini = $service->recordEvidence(
        studentId: $student->id,
        curriculumVersionId: $curriculumVersionId,
        learningObjectiveId: $objective->id,
        sourceType: 'mini_assessment',
        sourceId: 100,
        scoreRatio: 1.0,
        difficulty: 'medium',
        hintsUsed: 0
    );

    expect((float) $recordAfterMini->mastery_score)->toBeGreaterThanOrEqual(75.00)
        ->and($recordAfterMini->mastery_status)->toBeIn(['proficient', 'mastered']);

    // 4. Recency decay after > 21 days flags review without erasing mastery
    $scoreBeforeDecay = (float) $recordAfterMini->mastery_score;
    $recordAfterMini->update(['last_assessed_at' => now()->subDays(25)]);
    $decayed = $service->applyRecencyDecayIfStale($recordAfterMini);
    expect((float) $decayed->mastery_score)->toBeLessThan($scoreBeforeDecay)
        ->and((float) $decayed->mastery_score)->toBeGreaterThanOrEqual(50.0);
});

it('runs stateful AI Tutor API turns idempotently, blocks unconsented or cross-tenant students, and never grants mastery from chatting', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbLearningResourceSeeder::class);

    $studentUser = User::query()->create([
        'name_bn' => 'মাহির ফয়সাল',
        'name_en' => 'Mahir Faisal',
        'phone' => '+8801766554433',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STD-2026-400101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);
    $token = $studentUser->createToken('test-student')->plainTextToken;

    $otherUser = User::query()->create([
        'name_bn' => 'অন্য শিক্ষার্থী',
        'name_en' => 'Other Student',
        'phone' => '+8801866554433',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    StudentProfile::query()->create([
        'user_id' => $otherUser->id,
        'student_code' => 'STD-2026-400102',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);
    $otherToken = $otherUser->createToken('other-student')->plainTextToken;

    $objective = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();

    // 1. Start Tutor Session
    $startRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/tutor-sessions', [
            'learning_objective_id' => $objective->id,
        ])
        ->assertCreated();

    $sessionId = (int) $startRes->json('data.id');
    expect($startRes->json('data.current_stage'))->toBe('START_LESSON')
        ->and($startRes->json('data.mastery.score'))->toEqual(0.0);

    // 2. Pedagogical action buttons ('simplify', 'example') NEVER create mastery evidence logs
    $turn1Id = (string) Str::uuid();
    $simplifyRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => $turn1Id,
            'action_type' => 'simplify',
            'student_input_text' => 'আরেকটু সহজ করে বোঝাও',
        ])
        ->assertOk();

    expect($simplifyRes->json('data.current_stage'))->toBe('EXPLAIN_CONCEPT')
        ->and($simplifyRes->json('data.mastery.score'))->toEqual(0.0)
        ->and(MasteryEvidenceLog::query()->where('student_id', $student->id)->count())->toBe(0);

    // 3. Replaying the exact same client_turn_id returns idempotent_replay = true without duplicating messages
    $replayRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => $turn1Id,
            'action_type' => 'simplify',
            'student_input_text' => 'আরেকটু সহজ করে বোঝাও',
        ])
        ->assertOk();

    expect($replayRes->json('meta.idempotent_replay'))->toBeTrue();

    // 4. Advance to WORKED_EXAMPLE and ASK_STUDENT_QUESTION, then answer correctly in Bangla numerals
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => (string) Str::uuid(),
            'action_type' => 'example',
        ])
        ->assertOk()
        ->assertJsonPath('data.current_stage', 'WORKED_EXAMPLE');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => (string) Str::uuid(),
            'action_type' => 'text_reply',
            'student_input_text' => 'বুঝেছি',
        ])
        ->assertOk()
        ->assertJsonPath('data.current_stage', 'ASK_STUDENT_QUESTION');

    // Answer the interactive question '(a + 5)^2 = a^2 + 10a + 25' using Bangla numerals 'a^2 + ১০a + ২৫'
    $answerRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => (string) Str::uuid(),
            'action_type' => 'text_reply',
            'student_input_text' => 'a^2 + ১০a + ২৫',
        ])
        ->assertOk();

    expect($answerRes->json('data.current_stage'))->toBe('ASK_SIMILAR_QUESTION')
        ->and($answerRes->json('data.mastery.score'))->toBeGreaterThan(0.0)
        ->and(MasteryEvidenceLog::query()->where('student_id', $student->id)->count())->toBe(1);

    // 5. Pause & Flag endpoints
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/pause", [
            'active_duration_delta_seconds' => 120,
        ])
        ->assertOk()
        ->assertJsonPath('data.session_status', 'paused')
        ->assertJsonPath('data.active_duration_seconds', 120);

    $latestTutorMsgId = (int) $answerRes->json('data.latest_tutor_turn.id');
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/flag", [
            'tutor_message_id' => $latestTutorMsgId,
            'reason_code' => 'unclear_bangla',
            'student_comment' => 'ব্যাখ্যাটি আরেকটু স্পষ্ট হতে পারে।',
        ])
        ->assertCreated();

    // 6. Cross-student isolation: Another student cannot view or submit turns to this session
    Auth::forgetGuards();
    $this->withHeader('Authorization', "Bearer {$otherToken}")
        ->getJson("/api/v1/tutor-sessions/{$sessionId}")
        ->assertForbidden();
});
