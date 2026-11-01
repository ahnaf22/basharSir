<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\AcademicContent\Domain\Enums\ResourceType;
use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\Identity\Domain\Enums\AccountType;

final readonly class CreateLearningResourceAction
{
    /**
     * @param  array<string, mixed>|null  $mediaAssets
     */
    public function execute(
        User $actor,
        int $curriculumVersionId,
        int $chapterId,
        ?int $topicId,
        ?int $learningObjectiveId,
        ResourceType $resourceType,
        string $titleBn,
        string $contentMarkdown,
        ?string $nctbPageReference,
        ?array $mediaAssets = null,
    ): LearningResource {
        if ($actor->account_type !== AccountType::Admin && $actor->account_type !== AccountType::Reviewer) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_CMS_EDITOR_ONLY',
                message: 'শুধুমাত্র অ্যাডমিন অথবা কনটেন্ট রিভিউয়ার নতুন পাঠ্য উপকরণ তৈরি করতে পারবেন।',
                httpStatus: 403,
            );
        }

        /** @var LearningResource $resource */
        $resource = LearningResource::query()->create([
            'curriculum_version_id' => $curriculumVersionId,
            'chapter_id' => $chapterId,
            'topic_id' => $topicId,
            'learning_objective_id' => $learningObjectiveId,
            'resource_type' => $resourceType,
            'title_bn' => $titleBn,
            'content_markdown' => $contentMarkdown,
            'media_assets_json' => $mediaAssets,
            'nctb_page_reference' => $nctbPageReference,
            'workflow_status' => ResourceWorkflowStatus::Draft,
            'created_by' => $actor->id,
        ]);

        return $resource;
    }
}
