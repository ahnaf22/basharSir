<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Models;

use App\Modules\Evaluation\Models\Evaluation;
use App\Modules\QuestionBank\Models\Question;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $exam_attempt_id
 * @property int $question_id
 * @property string $answer_mode
 * @property string|null $selected_option_key
 * @property string|null $typed_answer_text
 * @property bool $is_flagged_for_review
 * @property int $time_spent_seconds
 * @property-read ExamAttempt $examAttempt
 * @property-read Question $question
 * @property-read Evaluation|null $evaluation
 */
final class SubmittedAnswer extends Model
{
    protected $table = 'submitted_answers';

    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'answer_mode',
        'selected_option_key',
        'typed_answer_text',
        'is_flagged_for_review',
        'time_spent_seconds',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_flagged_for_review' => 'boolean',
            'time_spent_seconds' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ExamAttempt, $this>
     */
    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    /**
     * @return HasOne<Evaluation, $this>
     */
    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class, 'submitted_answer_id');
    }
}
