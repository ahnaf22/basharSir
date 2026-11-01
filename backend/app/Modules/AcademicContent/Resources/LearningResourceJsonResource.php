<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Resources;

use App\Modules\AcademicContent\Models\LearningResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LearningResource
 */
final class LearningResourceJsonResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'curriculum_version_id' => $this->curriculum_version_id,
            'chapter_id' => $this->chapter_id,
            'topic_id' => $this->topic_id,
            'learning_objective_id' => $this->learning_objective_id,
            'resource_type' => $this->resource_type->value,
            'title_bn' => $this->title_bn,
            'content_markdown' => $this->content_markdown,
            'media_assets' => $this->media_assets_json,
            'nctb_page_reference' => $this->nctb_page_reference,
            'workflow_status' => $this->workflow_status->value,
            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'vector_embedding_id' => $this->vector_embedding_id,
            'rag_chunks_count' => $this->whenLoaded(
                'ragChunks',
                fn (): int => $this->ragChunks->count(),
            ),
        ];
    }
}
