<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $chapter_id
 * @property string $topic_number
 * @property string $title_bn
 * @property string $title_en
 * @property int $estimated_minutes
 * @property string $difficulty_level
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Chapter $chapter
 * @property-read Collection<int, LearningObjective> $learningObjectives
 */
#[Fillable([
    'chapter_id',
    'topic_number',
    'title_bn',
    'title_en',
    'estimated_minutes',
    'difficulty_level',
    'sort_order',
])]
class Topic extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Chapter, $this>
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    /**
     * @return HasMany<LearningObjective, $this>
     */
    public function learningObjectives(): HasMany
    {
        return $this->hasMany(LearningObjective::class, 'topic_id');
    }
}
