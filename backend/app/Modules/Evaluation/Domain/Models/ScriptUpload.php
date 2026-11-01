<?php

declare(strict_types=1);

namespace App\Modules\Evaluation\Domain\Models;

use App\Modules\QuestionBank\Models\Question;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property int $student_id
 * @property int|null $exam_attempt_id
 * @property int $question_id
 * @property int $page_count
 * @property array<int, array<string, mixed>> $pages_meta_json
 * @property float $image_quality_score
 * @property bool $orientation_valid
 * @property string|null $ocr_text_bn
 * @property float $ocr_confidence_score
 * @property float $rubric_confidence_score
 * @property float $awarded_marks
 * @property float $max_marks
 * @property array<int, array<string, mixed>>|null $rubric_breakdown_json
 * @property string $status
 * @property int|null $reviewer_user_id
 * @property string|null $reviewer_notes_bn
 * @property Carbon|null $reviewed_at
 * @property-read Question $question
 */
final class ScriptUpload extends Model
{
    protected $table = 'script_uploads';

    protected $fillable = [
        'uuid',
        'student_id',
        'exam_attempt_id',
        'question_id',
        'page_count',
        'pages_meta_json',
        'image_quality_score',
        'orientation_valid',
        'ocr_text_bn',
        'ocr_confidence_score',
        'rubric_confidence_score',
        'awarded_marks',
        'max_marks',
        'rubric_breakdown_json',
        'status',
        'reviewer_user_id',
        'reviewer_notes_bn',
        'reviewed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'student_id' => 'integer',
            'exam_attempt_id' => 'integer',
            'question_id' => 'integer',
            'page_count' => 'integer',
            'pages_meta_json' => 'array',
            'image_quality_score' => 'float',
            'orientation_valid' => 'boolean',
            'ocr_confidence_score' => 'float',
            'rubric_confidence_score' => 'float',
            'awarded_marks' => 'float',
            'max_marks' => 'float',
            'rubric_breakdown_json' => 'array',
            'reviewer_user_id' => 'integer',
            'reviewed_at' => 'datetime',
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
