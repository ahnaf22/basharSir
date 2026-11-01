<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use App\Modules\Curriculum\Domain\Enums\EducationStage;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $curriculum_version_id
 * @property int $grade_level
 * @property EducationStage $education_stage
 * @property string $title_bn
 * @property string $title_en
 * @property array<string, mixed>|null $teaching_persona_config
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read Collection<int, Subject> $subjects
 */
#[Fillable([
    'curriculum_version_id',
    'grade_level',
    'education_stage',
    'title_bn',
    'title_en',
    'teaching_persona_config',
])]
class AcademicClass extends Model
{
    protected $table = 'classes';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'grade_level' => 'integer',
            'education_stage' => EducationStage::class,
            'teaching_persona_config' => 'array',
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
     * @return HasMany<Subject, $this>
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'class_id');
    }
}
