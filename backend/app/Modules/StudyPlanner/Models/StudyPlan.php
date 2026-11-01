<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Models;

use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $curriculum_version_id
 * @property string $title
 * @property Carbon $target_completion_date
 * @property int $daily_study_minutes
 * @property string $status
 * @property string $completion_percentage
 * @property array<string, mixed> $config_json
 * @property-read StudentProfile $student
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read Collection<int, StudyPlanItem> $items
 */
final class StudyPlan extends Model
{
    protected $table = 'study_plans';

    protected $fillable = [
        'student_id',
        'curriculum_version_id',
        'title',
        'target_completion_date',
        'daily_study_minutes',
        'status',
        'completion_percentage',
        'config_json',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_completion_date' => 'date',
            'daily_study_minutes' => 'integer',
            'completion_percentage' => 'decimal:2',
            'config_json' => 'array',
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
     * @return HasMany<StudyPlanItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StudyPlanItem::class, 'study_plan_id');
    }
}
