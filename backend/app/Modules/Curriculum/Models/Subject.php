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
 * @property int $class_id
 * @property string $nctb_subject_code
 * @property string $title_bn
 * @property string $title_en
 * @property string $slug
 * @property array<string, mixed>|null $exam_structure_json
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read AcademicClass $academicClass
 * @property-read Collection<int, Chapter> $chapters
 */
#[Fillable([
    'class_id',
    'nctb_subject_code',
    'title_bn',
    'title_en',
    'slug',
    'exam_structure_json',
    'sort_order',
    'is_active',
])]
class Subject extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'exam_structure_json' => 'array',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<AcademicClass, $this>
     */
    public function academicClass(): BelongsTo
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    /**
     * @return HasMany<Chapter, $this>
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class, 'subject_id');
    }
}
