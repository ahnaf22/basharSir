<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbLearningResourceSeeder;

it('enforces Draft -> In Review -> Approved -> Published workflow, indexes RAG chunks on publish, and blocks premature publishing', function (): void {
    $this->seed(NctbCurriculumSeeder::class);

    $reviewer = User::factory()->create([
        'account_type' => AccountType::Reviewer,
    ]);

    $studentUser = User::factory()->create([
        'account_type' => AccountType::Student,
    ]);

    StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STD-2026-009911',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
        'daily_study_target_mins' => 60,
    ]);

    /** @var CurriculumVersion $version */
    $version = CurriculumVersion::query()->where('version_code', 'NCTB-2026-BM-v1.0')->firstOrFail();
    /** @var LearningObjective $lo */
    $lo = LearningObjective::query()->with('topic')->where('code', 'C8-MATH-CH4-T1-LO2')->firstOrFail();

    // 1. Student cannot create CMS resources
    $this->actingAs($studentUser, 'sanctum')
        ->postJson('/api/v1/resources', [
            'curriculum_version_id' => $version->id,
            'chapter_id' => $lo->topic->chapter_id,
            'topic_id' => $lo->topic_id,
            'learning_objective_id' => $lo->id,
            'resource_type' => 'worked_example',
            'title_bn' => 'সমাধানকৃত উদাহরণ: মান নির্ণয়',
            'content_markdown' => 'দেওয়া আছে $a + b = 5$ এবং $ab = 6$। অতএব $a^2 + b^2 = (a+b)^2 - 2ab = 25 - 12 = 13$।',
        ])
        ->assertStatus(403)
        ->assertJsonPath('error.code', 'FORBIDDEN_CMS_EDITOR_ONLY');

    // 2. Reviewer creates Draft resource
    $createResponse = $this->actingAs($reviewer, 'sanctum')
        ->postJson('/api/v1/resources', [
            'curriculum_version_id' => $version->id,
            'chapter_id' => $lo->topic->chapter_id,
            'topic_id' => $lo->topic_id,
            'learning_objective_id' => $lo->id,
            'resource_type' => 'worked_example',
            'title_bn' => 'সমাধানকৃত উদাহরণ: মান নির্ণয়',
            'content_markdown' => implode("\n\n", [
                '### অনুসিদ্ধান্তের প্রয়োগ',
                'দেওয়া আছে $a + b = 5$ এবং $ab = 6$।',
                'আমরা জানি, $a^2 + b^2 = (a+b)^2 - 2ab = 5^2 - 2(6) = 25 - 12 = 13$।',
            ]),
            'nctb_page_reference' => 'পৃষ্ঠা ৫০',
        ]);

    $createResponse->assertCreated()
        ->assertJsonPath('data.workflow_status', 'draft');

    /** @var int $resourceId */
    $resourceId = $createResponse->json('data.id');

    // 3. Attempting to jump directly from Draft -> Published is blocked (422)
    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/resources/{$resourceId}/workflow", [
            'target_status' => 'published',
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'INVALID_RESOURCE_WORKFLOW_TRANSITION');

    // 4. Draft -> In Review -> Approved -> Published succeeds and triggers IndexPublishedResourceJob
    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/resources/{$resourceId}/workflow", [
            'target_status' => 'in_review',
        ])
        ->assertOk()
        ->assertJsonPath('data.workflow_status', 'in_review');

    $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/resources/{$resourceId}/workflow", [
            'target_status' => 'approved',
        ])
        ->assertOk()
        ->assertJsonPath('data.workflow_status', 'approved')
        ->assertJsonPath('data.reviewed_by', $reviewer->id);

    $publishResponse = $this->actingAs($reviewer, 'sanctum')
        ->postJson("/api/v1/resources/{$resourceId}/workflow", [
            'target_status' => 'published',
        ]);

    $publishResponse->assertOk()
        ->assertJsonPath('data.workflow_status', 'published');

    expect($publishResponse->json('data.vector_embedding_id'))->toBeString()->toStartWith('vec_res_')
        ->and($publishResponse->json('data.rag_chunks_count'))->toBeGreaterThan(0);

    // 5. RAG chunk retrieval scoped by learning_objective_id returns the indexed chunks
    $ragResponse = $this->actingAs($studentUser, 'sanctum')
        ->getJson("/api/v1/curriculum/objectives/{$lo->id}/rag-chunks");

    $ragResponse->assertOk()
        ->assertJsonPath('data.learning_objective_id', $lo->id);

    expect($ragResponse->json('data.chunks'))->toBeArray()->not->toBeEmpty()
        ->and($ragResponse->json('data.chunks.0.nctb_page_reference'))->toBe('পৃষ্ঠা ৫০');
});

it('exports watermarked PDF for published resources and saves student bookmarks & personal notes', function (): void {
    $this->seed([
        NctbCurriculumSeeder::class,
        NctbLearningResourceSeeder::class,
    ]);

    $studentUser = User::factory()->create([
        'account_type' => AccountType::Student,
    ]);

    StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STD-2026-007788',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
        'daily_study_target_mins' => 60,
    ]);

    /** @var Chapter $ch4 */
    $ch4 = Chapter::query()->where('title_bn', 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ')->whereHas('subject.academicClass', function ($q): void {
        $q->where('grade_level', 8);
    })->firstOrFail();

    $listResponse = $this->actingAs($studentUser, 'sanctum')
        ->getJson("/api/v1/chapters/{$ch4->id}/resources");

    $listResponse->assertOk()
        ->assertJsonCount(2, 'data.resources');

    /** @var int $resourceId */
    $resourceId = $listResponse->json('data.resources.0.id');

    $pdfResponse = $this->actingAs($studentUser, 'sanctum')
        ->get("/api/v1/resources/{$resourceId}/pdf");

    $pdfResponse->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('X-Watermark-Identity', 'STD-2026-007788');

    expect($pdfResponse->getContent())->toStartWith('%PDF-1.4')
        ->and($pdfResponse->getContent())->toContain('STD-2026-007788');

    // Save student bookmark & personal note
    $annotationResponse = $this->actingAs($studentUser, 'sanctum')
        ->putJson("/api/v1/resources/{$resourceId}/annotations", [
            'is_bookmarked' => true,
            'highlights' => ['(a + b)^2 = a^2 + 2ab + b^2'],
            'personal_note_markdown' => 'পরীক্ষার আগে এই সূত্রের অনুসিদ্ধান্তটি রিভিশন দিতে হবে।',
        ]);

    $annotationResponse->assertOk()
        ->assertJsonPath('data.is_bookmarked', true)
        ->assertJsonPath('data.personal_note_markdown', 'পরীক্ষার আগে এই সূত্রের অনুসিদ্ধান্তটি রিভিশন দিতে হবে।');
});
