<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Domain\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $group_session_id
 * @property int $student_id
 * @property string $student_question_bn
 * @property string $ai_side_explanation_bn
 * @property bool $pii_redacted
 */
final class GroupIndividualAssistance extends Model
{
    protected $table = 'group_individual_assistances';

    protected $fillable = [
        'group_session_id',
        'student_id',
        'student_question_bn',
        'ai_side_explanation_bn',
        'pii_redacted',
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
        ];
    }
}
