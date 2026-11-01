<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Models;

use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $curriculum_version_id
 * @property int $subject_id
 * @property int|null $created_by_student_id
 * @property string $exam_type
 * @property string $title_bn
 * @property int $duration_minutes
 * @property string $total_marks
 * @property array<string, mixed> $question_blueprint_json
 * @property-read Subject $subject
 * @property-read Collection<int, ExamAttempt> $attempts
 */
final class Exam extends Model
{
    protected $table = 'exams';

    protected $fillable = [
        'uuid',
        'curriculum_version_id',
        'subject_id',
        'created_by_student_id',
        'exam_type',
        'title_bn',
        'duration_minutes',
        'total_marks',
        'question_blueprint_json',
    ];

    protected static function booted(): void
    {
        self::creating(function (Exam $exam): void {
            if (empty($exam->uuid)) {
                $exam->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'total_marks' => 'decimal:2',
            'question_blueprint_json' => 'array',
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
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function createdByStudent(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'created_by_student_id');
    }

    /**
     * @return HasMany<ExamAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id');
    }
}
