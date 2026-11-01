<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $learning_objective_id
 * @property int $prerequisite_objective_id
 * @property bool $is_strict
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read LearningObjective $learningObjective
 * @property-read LearningObjective $prerequisiteObjective
 */
#[Fillable([
    'learning_objective_id',
    'prerequisite_objective_id',
    'is_strict',
])]
class ObjectivePrerequisite extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_strict' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function learningObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'learning_objective_id');
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function prerequisiteObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'prerequisite_objective_id');
    }
}
