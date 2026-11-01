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
 * @property int $subject_id
 * @property int $chapter_number
 * @property string $title_bn
 * @property string $title_en
 * @property string $syllabus_status
 * @property int $estimated_study_minutes
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Subject $subject
 * @property-read Collection<int, Topic> $topics
 */
#[Fillable([
    'subject_id',
    'chapter_number',
    'title_bn',
    'title_en',
    'syllabus_status',
    'estimated_study_minutes',
    'sort_order',
])]
class Chapter extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'chapter_number' => 'integer',
            'estimated_study_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * @return HasMany<Topic, $this>
     */
    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'chapter_id');
    }
}
