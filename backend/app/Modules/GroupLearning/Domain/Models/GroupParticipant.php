<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $group_session_id
 * @property int $student_id
 * @property string $pseudonym_bn
 * @property bool $is_kicked
 * @property string|null $moderation_reason_bn
 * @property Carbon $joined_at
 */
final class GroupParticipant extends Model
{
    protected $table = 'group_participants';

    protected $fillable = [
        'group_session_id',
        'student_id',
        'pseudonym_bn',
        'is_kicked',
        'moderation_reason_bn',
        'joined_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'group_session_id' => 'integer',
            'student_id' => 'integer',
            'is_kicked' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }
}
