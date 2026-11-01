<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Jobs;

use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\AcademicContent\Models\ResourceRagChunk;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

final class IndexPublishedResourceJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $learningResourceId,
    ) {}

    public function handle(): void
    {
        /** @var LearningResource|null $resource */
        $resource = LearningResource::query()->find($this->learningResourceId);

        if ($resource === null || $resource->workflow_status !== ResourceWorkflowStatus::Published) {
            return;
        }

        $paragraphs = preg_split('/\n\s*\n/u', trim($resource->content_markdown)) ?: [];
        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $paragraph) {
            $trimmed = trim($paragraph);
            if ($trimmed === '') {
                continue;
            }

            if ($currentChunk !== '' && mb_strlen($currentChunk."\n\n".$trimmed) > 750) {
                $chunks[] = $currentChunk;
                $currentChunk = $trimmed;
            } else {
                $currentChunk = $currentChunk === '' ? $trimmed : $currentChunk."\n\n".$trimmed;
            }
        }

        if ($currentChunk !== '') {
            $chunks[] = $currentChunk;
        }

        if ($chunks === []) {
            $chunks[] = trim($resource->content_markdown);
        }

        DB::transaction(function () use ($resource, $chunks): void {
            ResourceRagChunk::query()
                ->where('learning_resource_id', $resource->id)
                ->delete();

            foreach ($chunks as $index => $chunkText) {
                $tokenEstimate = max(1, (int) ceil(mb_strlen($chunkText) / 3.5));

                ResourceRagChunk::query()->create([
                    'learning_resource_id' => $resource->id,
                    'curriculum_version_id' => $resource->curriculum_version_id,
                    'chapter_id' => $resource->chapter_id,
                    'topic_id' => $resource->topic_id,
                    'learning_objective_id' => $resource->learning_objective_id,
                    'chunk_index' => $index,
                    'chunk_text' => $chunkText,
                    'token_estimate' => $tokenEstimate,
                    'embedding_vector_json' => $this->computeDeterministicEmbedding($chunkText),
                    'nctb_page_reference' => $resource->nctb_page_reference,
                ]);
            }

            $resource->update([
                'vector_embedding_id' => sprintf('vec_res_%d_v%d', $resource->id, count($chunks)),
            ]);
        });
    }

    /**
     * Generates a deterministic 8-dimensional normalized feature vector from text hashes
     * for local hybrid keyword + cosine similarity retrieval without external API lock-in.
     *
     * @return array<int, float>
     */
    private function computeDeterministicEmbedding(string $text): array
    {
        $hash = hash('sha256', $text);
        $vector = [];
        $normSquared = 0.0;

        for ($i = 0; $i < 8; $i++) {
            $hexSlice = substr($hash, $i * 8, 8);
            $intVal = (int) hexdec($hexSlice);
            $component = (($intVal % 2000) - 1000) / 1000.0;
            $vector[] = $component;
            $normSquared += $component * $component;
        }

        $norm = sqrt($normSquared);
        if ($norm <= 0.0) {
            return array_fill(0, 8, 0.0);
        }

        return array_map(
            static fn (float $val): float => round($val / $norm, 6),
            $vector
        );
    }
}
