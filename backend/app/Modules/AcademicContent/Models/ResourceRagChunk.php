<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $learning_resource_id
 * @property int $curriculum_version_id
 * @property int $chapter_id
 * @property int|null $topic_id
 * @property int|null $learning_objective_id
 * @property int $chunk_index
 * @property string $chunk_text
 * @property int $token_estimate
 * @property array<int, float>|null $embedding_vector_json
 * @property string|null $nctb_page_reference
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read LearningResource $learningResource
 */
#[Fillable([
    'learning_resource_id',
    'curriculum_version_id',
    'chapter_id',
    'topic_id',
    'learning_objective_id',
    'chunk_index',
    'chunk_text',
    'token_estimate',
    'embedding_vector_json',
    'nctb_page_reference',
])]
class ResourceRagChunk extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'chunk_index' => 'integer',
            'token_estimate' => 'integer',
            'embedding_vector_json' => 'array',
        ];
    }

    /**
     * @return BelongsTo<LearningResource, $this>
     */
    public function learningResource(): BelongsTo
    {
        return $this->belongsTo(LearningResource::class, 'learning_resource_id');
    }
}
