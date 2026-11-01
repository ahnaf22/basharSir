<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Models;

use App\Modules\Curriculum\Models\Subject;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property Carbon $study_date
 * @property int|null $subject_id
 * @property string $source_type
 * @property int $source_id
 * @property Carbon $session_start_at
 * @property Carbon $last_heartbeat_at
 * @property Carbon|null $session_end_at
 * @property int $active_seconds
 * @property int $paused_seconds
 * @property int $questions_attempted
 */
final class StudyTimeLog extends Model
{
    protected $table = 'study_time_logs';

    protected $fillable = [
        'student_id',
        'study_date',
        'subject_id',
        'source_type',
        'source_id',
        'session_start_at',
        'last_heartbeat_at',
        'session_end_at',
        'active_seconds',
        'paused_seconds',
        'questions_attempted',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'study_date' => 'date',
            'session_start_at' => 'datetime',
            'last_heartbeat_at' => 'datetime',
            'session_end_at' => 'datetime',
            'active_seconds' => 'integer',
            'paused_seconds' => 'integer',
            'questions_attempted' => 'integer',
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
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }
}
