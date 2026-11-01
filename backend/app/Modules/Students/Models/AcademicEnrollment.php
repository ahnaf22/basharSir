<?php

declare(strict_types=1);

namespace App\Modules\Students\Models;

use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\CurriculumVersion;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $curriculum_version_id
 * @property int $class_id
 * @property Carbon $enrolled_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read StudentProfile $student
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read AcademicClass $academicClass
 */
#[Fillable([
    'student_id',
    'curriculum_version_id',
    'class_id',
    'enrolled_at',
    'is_active',
])]
class AcademicEnrollment extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * @return BelongsTo<CurriculumVersion, $this>
     */
    public function curriculumVersion(): BelongsTo
    {
        return $this->belongsTo(CurriculumVersion::class, 'curriculum_version_id');
    }

    /**
     * @return BelongsTo<AcademicClass, $this>
     */
    public function academicClass(): BelongsTo
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }
}
