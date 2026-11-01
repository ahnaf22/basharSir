<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\ObjectivePrerequisite;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use Database\Seeders\NctbCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('generates a personalized study plan with prerequisite remedial injection and adapts to mastery status', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'তাসনিম জাহান',
        'name_en' => 'Tasnim Jahan',
        'phone' => '+8801722334455',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-500101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
        'daily_study_target_mins' => 60,
    ]);

    $token = $user->createToken('planner-test')->plainTextToken;

    $lo1 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();
    $lo2 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO2')->firstOrFail();
    $chapter = Chapter::query()->findOrFail($lo1->topic->chapter_id);
    $curriculumVersionId = $chapter->subject->academicClass->curriculum_version_id;

    // Link LO1 as a prerequisite of LO2 (if not already linked)
    ObjectivePrerequisite::query()->firstOrCreate([
        'learning_objective_id' => $lo2->id,
        'prerequisite_objective_id' => $lo1->id,
    ], [
        'is_strict' => true,
    ]);

    // Mark LO1 as struggling (35%) so LO1 triggers both prerequisite_remedial (for LO2) and extra guided_practice
    MasteryRecord::query()->create([
        'student_id' => $student->id,
        'curriculum_version_id' => $curriculumVersionId,
        'learning_objective_id' => $lo1->id,
        'mastery_score' => '35.00',
        'mastery_status' => 'struggling',
        'attempts_count' => 2,
        'correct_count' => 0,
    ]);

    $createRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/study-plans', [
            'title' => 'অষ্টম শ্রেণি বীজগণিত প্রস্তুতি পরিকল্পনা',
            'chapter_ids' => [$chapter->id],
            'target_completion_date' => now()->addDays(14)->toDateString(),
            'daily_study_minutes' => 60,
        ])
        ->assertCreated();

    $planId = (int) $createRes->json('data.id');
    /** @var array<int, array<string, mixed>> $items */
    $items = $createRes->json('data.items');
    $taskTypes = array_column($items, 'task_type');

    expect($items)->not->toBeEmpty()
        ->and($taskTypes)->toContain('prerequisite_remedial')
        ->and($taskTypes)->toContain('concept_lesson')
        ->and($taskTypes)->toContain('guided_practice')
        ->and($taskTypes)->toContain('chapter_quiz');

    // Simulate a missed task from 2 days ago and trigger adaptive rebalance
    $firstItemId = (int) $items[0]['id'];
    $missedDate = now()->subDays(2)->toDateString();
    StudyPlanItem::query()->where('id', $firstItemId)->update([
        'scheduled_date' => $missedDate,
        'status' => 'scheduled',
    ]);

    $rebalanceRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/study-plans/{$planId}/rebalance")
        ->assertOk();

    /** @var array<int, array<string, mixed>> $rebalancedItems */
    $rebalancedItems = $rebalanceRes->json('data.items');
    $rebalancedFirst = collect($rebalancedItems)->firstWhere('id', $firstItemId);

    expect($rebalancedFirst)->not->toBeNull()
        ->and($rebalancedFirst['status'])->toBe('rescheduled')
        ->and($rebalancedFirst['rescheduled_from_date'])->toBe($missedDate)
        ->and($rebalancedFirst['scheduled_date'])->toBeGreaterThanOrEqual(now()->toDateString());

    // Mark first item as completed via PATCH /api/v1/study-plan-items/{id}/reschedule
    $this->withHeader('Authorization', "Bearer {$token}")
        ->patchJson("/api/v1/study-plan-items/{$firstItemId}/reschedule", [
            'status' => 'completed',
            'actual_active_minutes' => 28,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonPath('data.actual_active_minutes', 28);

    $activePlanRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/study-plans/active')
        ->assertOk();

    expect((float) $activePlanRes->json('data.completion_percentage'))->toBeGreaterThan(0.0);
});

it('tracks 30-second active study heartbeats and excludes idle time beyond 120s cutoff', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'আরিফ রহমান',
        'name_en' => 'Arif Rahman',
        'phone' => '+8801911223344',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-500202',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $token = $user->createToken('heartbeat-test')->plainTextToken;

    // 1. First 30s active ping
    $ping1 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/analytics/study-heartbeat', [
            'source_type' => 'tutor_session',
            'source_id' => 77,
            'is_idle' => false,
            'elapsed_seconds' => 30,
            'questions_attempted_delta' => 1,
        ])
        ->assertOk();

    expect($ping1->json('data.active_seconds'))->toBe(30)
        ->and($ping1->json('data.paused_seconds'))->toBe(0)
        ->and($ping1->json('data.questions_attempted'))->toBe(1);

    // 2. Second 30s active ping -> active_seconds = 60
    $ping2 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/analytics/study-heartbeat', [
            'source_type' => 'tutor_session',
            'source_id' => 77,
            'is_idle' => false,
            'elapsed_seconds' => 30,
            'questions_attempted_delta' => 1,
        ])
        ->assertOk();

    expect($ping2->json('data.active_seconds'))->toBe(60)
        ->and($ping2->json('data.paused_seconds'))->toBe(0)
        ->and($ping2->json('data.questions_attempted'))->toBe(2);

    // 3. Idle ping (is_idle = true, 120s) -> NEVER increments active_seconds, increments paused_seconds
    $ping3 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/analytics/study-heartbeat', [
            'source_type' => 'tutor_session',
            'source_id' => 77,
            'is_idle' => true,
            'elapsed_seconds' => 120,
            'questions_attempted_delta' => 0,
        ])
        ->assertOk();

    expect($ping3->json('data.active_seconds'))->toBe(60)
        ->and($ping3->json('data.paused_seconds'))->toBe(120);

    // 4. Calendar endpoint aggregates active_minutes (1 min) vs paused_minutes (2 mins)
    $calRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/calendar')
        ->assertOk();

    expect($calRes->json('data.total_active_minutes'))->toBe(1)
        ->and($calRes->json('data.total_paused_minutes'))->toBe(2);
});
