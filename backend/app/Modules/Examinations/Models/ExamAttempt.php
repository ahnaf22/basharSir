<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $exam_id
 * @property int $student_id
 * @property string $status
 * @property Carbon $started_at
 * @property Carbon $expires_at
 * @property Carbon|null $submitted_at
 * @property string $obtained_marks
 * @property string $percentage_score
 * @property-read Exam $exam
 * @property-read StudentProfile $student
 * @property-read Collection<int, SubmittedAnswer> $submittedAnswers
 */
final class ExamAttempt extends Model
{
    protected $table = 'exam_attempts';

    protected $fillable = [
        'uuid',
        'exam_id',
        'student_id',
        'status',
        'started_at',
        'expires_at',
        'submitted_at',
        'obtained_marks',
        'percentage_score',
    ];

    protected static function booted(): void
    {
        self::creating(function (ExamAttempt $attempt): void {
            if (empty($attempt->uuid)) {
                $attempt->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
            'obtained_marks' => 'decimal:2',
            'percentage_score' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Exam, $this>
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * @return HasMany<SubmittedAnswer, $this>
     */
    public function submittedAnswers(): HasMany
    {
        return $this->hasMany(SubmittedAnswer::class, 'exam_attempt_id');
    }
}
