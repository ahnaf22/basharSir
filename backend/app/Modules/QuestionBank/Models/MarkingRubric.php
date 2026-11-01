<?php

declare(strict_types=1);

namespace App\Modules\QuestionBank\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $question_id
 * @property string $expected_answer_markdown
 * @property array<int, array<string, mixed>> $step_wise_marks_json
 * @property array<int, string>|null $required_points_json
 * @property array<int, string>|null $accepted_alternatives_json
 * @property array<int, array<string, mixed>>|null $common_mistakes_json
 * @property string|null $nctb_reference
 * @property-read Question $question
 */
final class MarkingRubric extends Model
{
    protected $table = 'marking_rubrics';

    protected $fillable = [
        'question_id',
        'expected_answer_markdown',
        'step_wise_marks_json',
        'required_points_json',
        'accepted_alternatives_json',
        'common_mistakes_json',
        'nctb_reference',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'step_wise_marks_json' => 'array',
            'required_points_json' => 'array',
            'accepted_alternatives_json' => 'array',
            'common_mistakes_json' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
