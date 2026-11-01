<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use App\Modules\Curriculum\Domain\Enums\BloomLevel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $topic_id
 * @property string $code
 * @property string $title_bn
 * @property string $title_en
 * @property BloomLevel $bloom_level
 * @property int $mastery_threshold_pct
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Topic $topic
 * @property-read Collection<int, ObjectivePrerequisite> $prerequisiteLinks
 * @property-read Collection<int, LearningObjective> $prerequisites
 */
#[Fillable([
    'topic_id',
    'code',
    'title_bn',
    'title_en',
    'bloom_level',
    'mastery_threshold_pct',
    'sort_order',
])]
class LearningObjective extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'bloom_level' => BloomLevel::class,
            'mastery_threshold_pct' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * @return HasMany<ObjectivePrerequisite, $this>
     */
    public function prerequisiteLinks(): HasMany
    {
        return $this->hasMany(ObjectivePrerequisite::class, 'learning_objective_id');
    }

    /**
     * @return BelongsToMany<LearningObjective, $this>
     */
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'objective_prerequisites',
            'learning_objective_id',
            'prerequisite_objective_id'
        )->withPivot('is_strict')->withTimestamps();
    }
}
