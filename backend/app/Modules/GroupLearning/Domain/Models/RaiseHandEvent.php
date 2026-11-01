<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $group_session_id
 * @property int $student_id
 * @property string $question_summary_bn
 * @property bool $pii_redacted
 * @property string $status
 * @property int $queue_position
 * @property string|null $ai_or_teacher_response_bn
 * @property Carbon|null $resolved_at
 */
final class RaiseHandEvent extends Model
{
    protected $table = 'raise_hand_events';

    protected $fillable = [
        'group_session_id',
        'student_id',
        'question_summary_bn',
        'pii_redacted',
        'status',
        'queue_position',
        'ai_or_teacher_response_bn',
        'resolved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'group_session_id' => 'integer',
            'student_id' => 'integer',
            'pii_redacted' => 'boolean',
            'queue_position' => 'integer',
            'resolved_at' => 'datetime',
        ];
    }
}
