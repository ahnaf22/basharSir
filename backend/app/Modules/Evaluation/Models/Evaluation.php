<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Models;

use App\Models\User;
use App\Modules\Examinations\Models\SubmittedAnswer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $submitted_answer_id
 * @property string $evaluator_type
 * @property string $marks_awarded
 * @property string $max_marks
 * @property string $confidence_score
 * @property string $review_status
 * @property array<int, array<string, mixed>>|null $step_breakdown_json
 * @property string|null $feedback_bn
 * @property string|null $nctb_citation
 * @property int|null $reviewed_by_user_id
 * @property-read SubmittedAnswer $submittedAnswer
 */
final class Evaluation extends Model
{
    protected $table = 'evaluations';

    protected $fillable = [
        'submitted_answer_id',
        'evaluator_type',
        'marks_awarded',
        'max_marks',
        'confidence_score',
        'review_status',
        'step_breakdown_json',
        'feedback_bn',
        'nctb_citation',
        'reviewed_by_user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'marks_awarded' => 'decimal:2',
            'max_marks' => 'decimal:2',
            'confidence_score' => 'decimal:3',
            'step_breakdown_json' => 'array',
        ];
    }

    /**
     * @return BelongsTo<SubmittedAnswer, $this>
     */
    public function submittedAnswer(): BelongsTo
    {
        return $this->belongsTo(SubmittedAnswer::class, 'submitted_answer_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
