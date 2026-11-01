<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Models;

use App\Modules\AI\Models\AiRequest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tutor_session_id
 * @property string $client_turn_id
 * @property string $sender_role
 * @property string $lesson_stage
 * @property string|null $student_action_type
 * @property string|null $student_input_text
 * @property array<string, mixed>|null $structured_payload_json
 * @property bool|null $is_answer_correct
 * @property string|null $misconception_code
 * @property int $hints_used_count
 * @property int|null $ai_request_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class TutorMessage extends Model
{
    protected $table = 'tutor_messages';

    protected $fillable = [
        'tutor_session_id',
        'client_turn_id',
        'sender_role',
        'lesson_stage',
        'student_action_type',
        'student_input_text',
        'structured_payload_json',
        'is_answer_correct',
        'misconception_code',
        'hints_used_count',
        'ai_request_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'structured_payload_json' => 'array',
            'is_answer_correct' => 'boolean',
            'hints_used_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<TutorSession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(TutorSession::class, 'tutor_session_id');
    }

    /**
     * @return BelongsTo<AiRequest, $this>
     */
    public function aiRequest(): BelongsTo
    {
        return $this->belongsTo(AiRequest::class, 'ai_request_id');
    }
}
