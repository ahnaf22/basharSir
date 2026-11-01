<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Models;

use App\Models\User;
use App\Modules\AcademicContent\Domain\Enums\ResourceType;
use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Topic;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $curriculum_version_id
 * @property int $chapter_id
 * @property int|null $topic_id
 * @property int|null $learning_objective_id
 * @property ResourceType $resource_type
 * @property string $title_bn
 * @property string $content_markdown
 * @property array<string, mixed>|null $media_assets_json
 * @property string|null $nctb_page_reference
 * @property ResourceWorkflowStatus $workflow_status
 * @property int|null $created_by
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $published_at
 * @property string|null $vector_embedding_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read Chapter $chapter
 * @property-read Topic|null $topic
 * @property-read LearningObjective|null $learningObjective
 * @property-read User|null $reviewer
 * @property-read Collection<int, ResourceRagChunk> $ragChunks
 */
#[Fillable([
    'curriculum_version_id',
    'chapter_id',
    'topic_id',
    'learning_objective_id',
    'resource_type',
    'title_bn',
    'content_markdown',
    'media_assets_json',
    'nctb_page_reference',
    'workflow_status',
    'created_by',
    'reviewed_by',
    'reviewed_at',
    'published_at',
    'vector_embedding_id',
])]
class LearningResource extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resource_type' => ResourceType::class,
            'media_assets_json' => 'array',
            'workflow_status' => ResourceWorkflowStatus::class,
            'reviewed_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<CurriculumVersion, $this>
     */
    public function curriculumVersion(): BelongsTo
    {
        return $this->belongsTo(CurriculumVersion::class, 'curriculum_version_id');
    }

    /**
     * @return BelongsTo<Chapter, $this>
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function learningObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'learning_objective_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return HasMany<ResourceRagChunk, $this>
     */
    public function ragChunks(): HasMany
    {
        return $this->hasMany(ResourceRagChunk::class, 'learning_resource_id');
    }
}
