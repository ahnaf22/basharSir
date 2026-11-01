<?php

declare(strict_types=1);

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Curriculum\Domain\Enums\CurriculumVersionStatus;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use Database\Seeders\NctbCurriculumSeeder;

it('seeds NCTB 2026 Class 6-8 Bangla Medium Math & Science curriculum tree and serves curriculum endpoints', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $user = User::factory()->create();

    $activeResponse = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/curriculum/active');

    $activeResponse->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.version_code', 'NCTB-2026-BM-v1.0')
        ->assertJsonPath('data.status', 'published')
        ->assertJsonCount(3, 'data.classes');

    $subjectsResponse = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/subjects?grade_level=8');

    $subjectsResponse->assertOk()
        ->assertJsonPath('data.grade_level', 8)
        ->assertJsonPath('data.class_title_bn', 'অষ্টম শ্রেণি')
        ->assertJsonCount(2, 'data.subjects')
        ->assertJsonPath('data.subjects.0.title_bn', 'গণিত')
        ->assertJsonPath('data.subjects.1.title_bn', 'বিজ্ঞান');

    /** @var Subject $c8Math */
    $c8Math = Subject::query()->whereHas('academicClass', function ($q): void {
        $q->where('grade_level', 8);
    })->where('slug', 'mathematics')->firstOrFail();

    $chaptersResponse = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/subjects/{$c8Math->id}/chapters");

    $chaptersResponse->assertOk()
        ->assertJsonCount(4, 'data.chapters');

    /** @var Chapter $ch4 */
    $ch4 = Chapter::query()
        ->where('subject_id', $c8Math->id)
        ->where('chapter_number', 4)
        ->firstOrFail();

    $topicsResponse = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/chapters/{$ch4->id}/topics");

    $topicsResponse->assertOk()
        ->assertJsonPath('data.chapter.title_bn', 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ')
        ->assertJsonCount(2, 'data.topics')
        ->assertJsonPath('data.topics.0.learning_objectives.0.code', 'C8-MATH-CH4-T1-LO1')
        ->assertJsonPath('data.topics.0.learning_objectives.0.prerequisites.0.code', 'C7-MATH-CH5-T1-LO1');
});

it('enforces published curriculum version immutability against destructive overwrites and deletion', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    /** @var CurriculumVersion $version */
    $version = CurriculumVersion::query()
        ->where('version_code', 'NCTB-2026-BM-v1.0')
        ->firstOrFail();

    expect(fn () => $version->update(['version_code' => 'MUTATED-CODE']))
        ->toThrow(DomainException::class);

    $version->refresh();
    expect(fn () => $version->update(['status' => CurriculumVersionStatus::Draft]))
        ->toThrow(DomainException::class);

    $version->refresh();
    expect(fn () => $version->delete())
        ->toThrow(DomainException::class);
});

it('detects and blocks self-referential and transitive cycles in the learning objective prerequisite DAG', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $user = User::factory()->create();

    /** @var LearningObjective $lo1 */
    $lo1 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();
    /** @var LearningObjective $lo3 */
    $lo3 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T2-LO1')->firstOrFail();

    // Self-dependency check (LO1 -> LO1)
    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/curriculum/objectives/{$lo1->id}/prerequisites", [
            'prerequisite_objective_id' => $lo1->id,
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'PREREQUISITE_CYCLE_DETECTED');

    // Transitive cycle check: Seeded graph has LO3 -> LO2 -> LO1.
    // Attempting to make LO3 a prerequisite of LO1 creates cycle LO1 -> LO3 -> LO2 -> LO1!
    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/curriculum/objectives/{$lo1->id}/prerequisites", [
            'prerequisite_objective_id' => $lo3->id,
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'PREREQUISITE_CYCLE_DETECTED');
});
