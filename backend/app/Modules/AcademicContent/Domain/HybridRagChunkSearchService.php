<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Domain;

use App\Modules\AcademicContent\Models\ResourceRagChunk;
use Illuminate\Database\Eloquent\Collection;

final class HybridRagChunkSearchService
{
    /**
     * Retrieves published RAG grounding chunks strictly scoped to a specific
     * `learning_objective_id` (and optional search query) within the token budget (< 3,500 tokens).
     *
     * @return Collection<int, ResourceRagChunk>
     */
    public function retrieveForObjective(
        int $learningObjectiveId,
        ?string $searchQuery = null,
        int $maxTokenBudget = 3500,
    ): Collection {
        $query = ResourceRagChunk::query()
            ->with('learningResource')
            ->where('learning_objective_id', $learningObjectiveId)
            ->orderBy('learning_resource_id')
            ->orderBy('chunk_index');

        if ($searchQuery !== null && trim($searchQuery) !== '') {
            $term = trim($searchQuery);
            $query->where('chunk_text', 'like', "%{$term}%");
        }

        /** @var Collection<int, ResourceRagChunk> $candidates */
        $candidates = $query->get();

        $selected = new Collection;
        $accumulatedTokens = 0;

        foreach ($candidates as $chunk) {
            if ($accumulatedTokens + $chunk->token_estimate > $maxTokenBudget) {
                break;
            }
            $selected->push($chunk);
            $accumulatedTokens += $chunk->token_estimate;
        }

        return $selected;
    }
}
