<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property string|null $join_code
 * @property int $learning_objective_id
 * @property string $title_bn
 * @property int $target_class_level
 * @property string $target_medium
 * @property int $min_participants
 * @property int $max_participants
 * @property string $status
 * @property string $teaching_mode
 * @property string $current_lesson_stage
 * @property string|null $shared_board_markdown_bn
 * @property Carbon $scheduled_at
 */
final class GroupSession extends Model
{
    protected $table = 'group_sessions';

    protected $fillable = [
        'uuid',
        'join_code',
        'learning_objective_id',
        'title_bn',
        'target_class_level',
        'target_medium',
        'min_participants',
        'max_participants',
        'status',
        'teaching_mode',
        'current_lesson_stage',
        'shared_board_markdown_bn',
        'scheduled_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'learning_objective_id' => 'integer',
            'target_class_level' => 'integer',
            'min_participants' => 'integer',
            'max_participants' => 'integer',
            'scheduled_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<GroupParticipant, $this>
     */
    public function participants(): HasMany
    {
        return $this->hasMany(GroupParticipant::class, 'group_session_id');
    }

    /**
     * @return HasMany<RaiseHandEvent, $this>
     */
    public function raiseHandEvents(): HasMany
    {
        return $this->hasMany(RaiseHandEvent::class, 'group_session_id');
    }

    /**
     * @return HasMany<GroupBroadcastQuestion, $this>
     */
    public function broadcastQuestions(): HasMany
    {
        return $this->hasMany(GroupBroadcastQuestion::class, 'group_session_id');
    }

    /**
     * @return HasMany<GroupIndividualAssistance, $this>
     */
    public function individualAssistances(): HasMany
    {
        return $this->hasMany(GroupIndividualAssistance::class, 'group_session_id');
    }
}
