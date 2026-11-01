<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Models;

use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
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
 * @property int $learning_objective_id
 * @property string $mastery_score
 * @property string $mastery_status
 * @property int $attempts_count
 * @property int $correct_count
 * @property Carbon|null $last_assessed_at
 * @property Carbon|null $next_review_due_at
 * @property-read StudentProfile $student
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read LearningObjective $learningObjective
 * @property-read Collection<int, MasteryEvidenceLog> $evidenceLogs
 */
final class MasteryRecord extends Model
{
    protected $table = 'mastery_records';

    protected $fillable = [
        'student_id',
        'curriculum_version_id',
        'learning_objective_id',
        'mastery_score',
        'mastery_status',
        'attempts_count',
        'correct_count',
        'last_assessed_at',
        'next_review_due_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mastery_score' => 'decimal:2',
            'attempts_count' => 'integer',
            'correct_count' => 'integer',
            'last_assessed_at' => 'datetime',
            'next_review_due_at' => 'datetime',
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
     * @return BelongsTo<LearningObjective, $this>
     */
    public function learningObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'learning_objective_id');
    }

    /**
     * @return HasMany<MasteryEvidenceLog, $this>
     */
    public function evidenceLogs(): HasMany
    {
        return $this->hasMany(MasteryEvidenceLog::class, 'mastery_record_id');
    }
}
