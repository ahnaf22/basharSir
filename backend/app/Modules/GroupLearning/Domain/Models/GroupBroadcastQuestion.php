<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $group_session_id
 * @property string $stem_bn
 * @property array<string, string> $options_json
 * @property string $correct_option_key
 * @property string $explanation_bn
 * @property bool $is_revealed
 */
final class GroupBroadcastQuestion extends Model
{
    protected $table = 'group_broadcast_questions';

    protected $fillable = [
        'group_session_id',
        'stem_bn',
        'options_json',
        'correct_option_key',
        'explanation_bn',
        'is_revealed',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'group_session_id' => 'integer',
            'options_json' => 'array',
            'is_revealed' => 'boolean',
        ];
    }

    /**
     * @return HasMany<GroupBroadcastResponse, $this>
     */
    public function responses(): HasMany
    {
        return $this->hasMany(GroupBroadcastResponse::class, 'broadcast_question_id');
    }
}

