<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $mastery_record_id
 * @property int $student_id
 * @property string $source_type
 * @property int $source_id
 * @property string $question_difficulty
 * @property string $score_ratio
 * @property int $hints_used
 * @property string $previous_mastery
 * @property string $new_mastery
 * @property Carbon $recorded_at
 */
final class MasteryEvidenceLog extends Model
{
    protected $table = 'mastery_evidence_logs';

    protected $fillable = [
        'mastery_record_id',
        'student_id',
        'source_type',
        'source_id',
        'question_difficulty',
        'score_ratio',
        'hints_used',
        'previous_mastery',
        'new_mastery',
        'recorded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score_ratio' => 'decimal:3',
            'hints_used' => 'integer',
            'previous_mastery' => 'decimal:2',
            'new_mastery' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<MasteryRecord, $this>
     */
    public function masteryRecord(): BelongsTo
    {
        return $this->belongsTo(MasteryRecord::class, 'mastery_record_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }
}
