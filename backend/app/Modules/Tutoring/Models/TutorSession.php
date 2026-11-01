<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Models;

use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Topic;
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
 * @property int $student_id
 * @property int $curriculum_version_id
 * @property int $topic_id
 * @property int $active_objective_id
 * @property string $current_stage
 * @property string $session_status
 * @property string|null $compact_summary_text
 * @property array<string, mixed> $state_metadata_json
 * @property int $active_duration_seconds
 * @property Carbon $started_at
 * @property Carbon|null $completed_at
 * @property-read StudentProfile $student
 * @property-read CurriculumVersion $curriculumVersion
 * @property-read Topic $topic
 * @property-read LearningObjective $activeObjective
 * @property-read Collection<int, TutorMessage> $messages
 */
final class TutorSession extends Model
{
    protected $table = 'tutor_sessions';

    protected $fillable = [
        'uuid',
        'student_id',
        'curriculum_version_id',
        'topic_id',
        'active_objective_id',
        'current_stage',
        'session_status',
        'compact_summary_text',
        'state_metadata_json',
        'active_duration_seconds',
        'started_at',
        'completed_at',
    ];

    protected static function booted(): void
    {
        self::creating(function (TutorSession $session): void {
            if (empty($session->uuid)) {
                $session->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'state_metadata_json' => 'array',
            'active_duration_seconds' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
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
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function activeObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'active_objective_id');
    }

    /**
     * @return HasMany<TutorMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TutorMessage::class, 'tutor_session_id');
    }
}
