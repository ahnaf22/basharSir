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

    // 3. GET /api/v1/curriculum/my-subjects
    $subjRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->getJson('/api/v1/curriculum/my-subjects')
        ->assertOk();

    expect($subjRes->json('data.grade_level'))->toBe(8)
        ->and($subjRes->json('data.subjects'))->not->toBeEmpty()
        ->and($subjRes->json('data.subjects.0.chapters'))->not->toBeEmpty();

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
