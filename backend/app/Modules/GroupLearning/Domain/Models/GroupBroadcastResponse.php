<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $broadcast_question_id
 * @property int $student_id
 * @property string $selected_option_key
 * @property bool $is_correct
 * @property Carbon $submitted_at
 */
final class GroupBroadcastResponse extends Model
{
    protected $table = 'group_broadcast_responses';

    protected $fillable = [
        'broadcast_question_id',
        'student_id',
        'selected_option_key',
        'is_correct',
        'submitted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'broadcast_question_id' => 'integer',
            'student_id' => 'integer',
            'is_correct' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }
}
