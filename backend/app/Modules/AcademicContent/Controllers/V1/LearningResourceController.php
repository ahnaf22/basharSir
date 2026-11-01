<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Controllers\V1;

use App\Core\Exceptions\DomainException;
use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\AcademicContent\Actions\CreateLearningResourceAction;
use App\Modules\AcademicContent\Actions\SaveStudentResourceAnnotationAction;
use App\Modules\AcademicContent\Actions\TransitionResourceWorkflowAction;
use App\Modules\AcademicContent\Domain\Enums\ResourceType;
use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\AcademicContent\Domain\HybridRagChunkSearchService;
use App\Modules\AcademicContent\Domain\WatermarkedPdfGenerator;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\AcademicContent\Models\ResourceRagChunk;
use App\Modules\AcademicContent\Requests\CreateLearningResourceRequest;
use App\Modules\AcademicContent\Requests\SaveResourceAnnotationRequest;
use App\Modules\AcademicContent\Requests\TransitionResourceWorkflowRequest;
use App\Modules\AcademicContent\Resources\LearningResourceJsonResource;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class LearningResourceController extends Controller
{
    public function listChapterResources(Request $request, Chapter $chapter): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $query = LearningResource::query()
            ->with('ragChunks')
            ->where('chapter_id', $chapter->id);

        if ($user->account_type !== AccountType::Admin && $user->account_type !== AccountType::Reviewer) {
            $query->where('workflow_status', ResourceWorkflowStatus::Published->value);
        }

        $resources = $query->orderBy('id')->get();

        return ApiResponse::success(
            data: [
                'chapter_id' => $chapter->id,
                'chapter_title_bn' => $chapter->title_bn,
                'resources' => LearningResourceJsonResource::collection($resources)->resolve($request),
            ],
            message: 'অধ্যায়ের পাঠ্য উপকরণসমূহ সফলভাবে লোড হয়েছে।',
        );
    }

    public function store(
        CreateLearningResourceRequest $request,
        CreateLearningResourceAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        /** @var string $resourceTypeRaw */
        $resourceTypeRaw = $request->validated('resource_type');
        /** @var string $titleBn */
        $titleBn = $request->validated('title_bn');
        /** @var string $contentMarkdown */
        $contentMarkdown = $request->validated('content_markdown');
        /** @var string|null $nctbRef */
        $nctbRef = $request->validated('nctb_page_reference');
        /** @var array<string, mixed>|null $mediaAssets */
        $mediaAssets = $request->validated('media_assets_json');

        $topicIdRaw = $request->validated('topic_id');
        $objectiveIdRaw = $request->validated('learning_objective_id');

        $resource = $action->execute(
            actor: $user,
            curriculumVersionId: (int) $request->validated('curriculum_version_id'),
            chapterId: (int) $request->validated('chapter_id'),
            topicId: $topicIdRaw !== null ? (int) $topicIdRaw : null,
            learningObjectiveId: $objectiveIdRaw !== null ? (int) $objectiveIdRaw : null,
            resourceType: ResourceType::from($resourceTypeRaw),
            titleBn: $titleBn,
            contentMarkdown: $contentMarkdown,
            nctbPageReference: $nctbRef,
            mediaAssets: $mediaAssets,
        );

        $resource->load('ragChunks');

        return ApiResponse::success(
            data: (new LearningResourceJsonResource($resource))->resolve($request),
            message: 'নতুন পাঠ্য উপকরণ (Draft) হিসেবে সংরক্ষিত হয়েছে।',
            status: 201,
        );
    }

    public function transitionWorkflow(
        TransitionResourceWorkflowRequest $request,
        LearningResource $resource,
        TransitionResourceWorkflowAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        /** @var string $targetRaw */
        $targetRaw = $request->validated('target_status');

        $updated = $action->execute(
            actor: $user,
            resource: $resource,
            targetStatus: ResourceWorkflowStatus::from($targetRaw),
        );

        $updated->load('ragChunks');

        return ApiResponse::success(
            data: (new LearningResourceJsonResource($updated))->resolve($request),
            message: 'পাঠ্য উপকরণের ওয়ার্কফ্লো অবস্থা সফলভাবে হালনাগাদ করা হয়েছে।',
        );
    }

    public function searchObjectiveRagChunks(
        Request $request,
        int $learningObjectiveId,
        HybridRagChunkSearchService $ragService,
    ): JsonResponse {
        $searchQueryParam = $request->query('q');
        $searchQuery = is_string($searchQueryParam) ? $searchQueryParam : null;

        $chunks = $ragService->retrieveForObjective(
            learningObjectiveId: $learningObjectiveId,
            searchQuery: $searchQuery,
        );

        return ApiResponse::success(
            data: [
                'learning_objective_id' => $learningObjectiveId,
                'chunks' => $chunks->map(static fn (ResourceRagChunk $chunk): array => [
                    'id' => $chunk->id,
                    'learning_resource_id' => $chunk->learning_resource_id,
                    'chunk_index' => $chunk->chunk_index,
                    'chunk_text' => $chunk->chunk_text,
                    'token_estimate' => $chunk->token_estimate,
                    'nctb_page_reference' => $chunk->nctb_page_reference,
                ])->all(),
            ],
            message: 'শিখনফল অনুযায়ী পাঠ্যপুস্তক গ্রাউন্ডিং (RAG) অংশগুলো পাওয়া গেছে।',
        );
    }

    public function downloadWatermarkedPdf(
        Request $request,
        LearningResource $resource,
        WatermarkedPdfGenerator $pdfGenerator,
    ): Response {
        /** @var User $user */
        $user = $request->user();

        if (
            $resource->workflow_status !== ResourceWorkflowStatus::Published
            && $user->account_type !== AccountType::Admin
            && $user->account_type !== AccountType::Reviewer
        ) {
            throw new DomainException(
                errorCode: 'RESOURCE_NOT_PUBLISHED',
                message: 'এই পাঠ্য উপকরণটি এখনো প্রকাশিত হয়নি।',
                httpStatus: 403,
            );
        }

        $user->loadMissing('studentProfile');
        $watermarkIdentity = $user->studentProfile->student_code ?? $user->uuid;

        $pdfBytes = $pdfGenerator->generate($resource, $watermarkIdentity);

        return response($pdfBytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="nctb-resource-%d.pdf"', $resource->id),
            'X-Watermark-Identity' => $watermarkIdentity,
        ]);
    }

    public function saveAnnotation(
        SaveResourceAnnotationRequest $request,
        LearningResource $resource,
        SaveStudentResourceAnnotationAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $isBookmarkedRaw = $request->validated('is_bookmarked');
        /** @var array<int, string>|null $highlights */
        $highlights = $request->validated('highlights');
        /** @var string|null $note */
        $note = $request->validated('personal_note_markdown');

        $annotation = $action->execute(
            user: $user,
            resource: $resource,
            isBookmarked: $isBookmarkedRaw !== null ? (bool) $isBookmarkedRaw : false,
            highlights: $highlights,
            personalNoteMarkdown: $note,
        );

        return ApiResponse::success(
            data: [
                'id' => $annotation->id,
                'learning_resource_id' => $annotation->learning_resource_id,
                'is_bookmarked' => $annotation->is_bookmarked,
                'highlights' => $annotation->highlights_json,
                'personal_note_markdown' => $annotation->personal_note_markdown,
            ],
            message: 'আপনার বুকমার্ক ও ব্যক্তিগত নোট সংরক্ষিত হয়েছে।',
        );
    }
}
