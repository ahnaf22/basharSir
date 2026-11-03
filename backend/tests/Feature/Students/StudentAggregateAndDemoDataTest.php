<?php

declare(strict_types=1);

use Database\Seeders\DemoDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('Chunk 7.2: seeds realistic interconnected demo data and serves /dashboard, /my-subjects, /exam-attempts, and /gamification/me', function (): void {
    $this->seed(DemoDataSeeder::class);

    // 1. Login with demo student
    $loginRes = $this->postJson('/api/v1/auth/login', [
        'phone' => '+8801712000001',
        'password' => 'password123',
    ])->assertOk();

    $studentToken = (string) $loginRes->json('data.access_token');
    expect($studentToken)->not->toBeEmpty();

    // 2. GET /api/v1/students/me/dashboard
    $dashRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/students/me/dashboard')
        ->assertOk();

    expect($dashRes->json('data.student.student_code'))->toBe('STU-2026-8001')
        ->and($dashRes->json('data.continue_lesson'))->not->toBeNull()
        ->and($dashRes->json('data.continue_lesson.session_id'))->toBeGreaterThan(0)
        ->and($dashRes->json('data.today_tasks'))->not->toBeEmpty()
        ->and($dashRes->json('data.streak.current_days'))->toBe(3)
        ->and($dashRes->json('data.gamification.total_xp'))->toBe(100)
        ->and($dashRes->json('data.today_study_time.active_seconds'))->toBe(1800)
        ->and($dashRes->json('data.subject_mastery'))->not->toBeEmpty();

    // 2b. Study-desk read model: derived fields only (no presentation-only invention)
    expect($dashRes->json('data.continue_lesson.learning_objective_id'))->toBeInt()
        ->and($dashRes->json('data.continue_lesson.chapter_number'))->toBeInt()
        ->and($dashRes->json('data.next_lesson'))->toBeNull()
        ->and($dashRes->json('data.streak.week'))->toHaveCount(7)
        ->and($dashRes->json('data.streak.week.0.weekday'))->toBe(6) // school week starts Saturday
        ->and(collect($dashRes->json('data.streak.week'))->where('is_today', true))->toHaveCount(1)
        ->and($dashRes->json('data.streak.next_milestone.target_days'))->toBe(7)
        ->and($dashRes->json('data.streak.next_milestone.remaining_days'))->toBe(4)
        ->and($dashRes->json('data.gamification.level.number'))->toBe(1)
        ->and($dashRes->json('data.gamification.level.next_level_total_xp'))->toBe(250)
        ->and($dashRes->json('data.subject_mastery.0.objectives'))->toBeArray()
        ->and($dashRes->json('data.subject_mastery.0.attempted_objectives'))->toBeInt();

    // 3. GET /api/v1/curriculum/my-subjects
    $subjRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/curriculum/my-subjects')
        ->assertOk();

    expect($subjRes->json('data.grade_level'))->toBe(8)
        ->and($subjRes->json('data.subjects'))->not->toBeEmpty()
        ->and($subjRes->json('data.subjects.0.chapters'))->not->toBeEmpty();

    // chapters carry their topics + objectives (the materials page and dashboard search read them),
    // and mastery_pct is a real 0-100 percentage
    $chapters = collect($subjRes->json('data.subjects'))->flatMap(fn (array $s): array => $s['chapters']);
    expect($chapters->every(fn (array $ch): bool => is_array($ch['topics']) && $ch['mastery_pct'] >= 0 && $ch['mastery_pct'] <= 100))->toBeTrue()
        ->and($chapters->sum(fn (array $ch): int => count($ch['topics'])))->toBe($chapters->sum(fn (array $ch): int => $ch['topics_count']))
        ->and($chapters->flatMap(fn (array $ch): array => $ch['topics'])->flatMap(fn (array $tp): array => $tp['learning_objectives'])->first())->toHaveKeys(['id', 'code', 'title_bn', 'bloom_taxonomy_level', 'mastery']);

    // 4. GET /api/v1/students/me/exam-attempts
    $attemptsRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/students/me/exam-attempts')
        ->assertOk();

    expect($attemptsRes->json('data.attempts'))->not->toBeEmpty()
        ->and(in_array($attemptsRes->json('data.attempts.0.status'), ['submitted', 'provisional_graded', 'graded'], true))->toBeTrue();

    // 5. GET /api/v1/gamification/me
    $gamificationRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/gamification/me')
        ->assertOk();

    expect($gamificationRes->json('data.total_xp'))->toBe(100)
        ->and($gamificationRes->json('data.streak.current_days'))->toBe(3)
        ->and($gamificationRes->json('data.recent_xp'))->toHaveCount(3);

    // 6. Login with demo guardian and verify children linking
    $this->flushHeaders();
    auth()->forgetGuards();
    $guardianLogin = $this->postJson('/api/v1/auth/login', [
        'phone' => '+8801712000000',
        'password' => 'password123',
    ])->assertOk();

    $guardianToken = (string) $guardianLogin->json('data.access_token');
    auth()->forgetGuards();
    $guardianMe = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->getJson('/api/v1/auth/me')
        ->assertOk();

    expect($guardianMe->json('data.linked_children'))->toHaveCount(2)
        ->and($guardianMe->json('data.entitlements.plan.tier'))->toBe('family');
});
