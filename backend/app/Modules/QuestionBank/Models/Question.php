<?php

declare(strict_types=1);

namespace App\Modules\QuestionBank\Models;

use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Curriculum\Models\Topic;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $curriculum_version_id
 * @property int $subject_id
 * @property int $chapter_id
 * @property int $topic_id
 * @property int $learning_objective_id
 * @property string $question_type
 * @property string $difficulty
 * @property string $marks
 * @property string $stem_markdown
 * @property array<int, array<string, mixed>>|null $options_json
 * @property array<int, array<string, mixed>>|null $sub_questions_json
 * @property array<string, mixed>|null $deterministic_answer_key_json
 * @property string $status
 * @property-read MarkingRubric|null $markingRubric
 * @property-read LearningObjective $learningObjective
 */
final class Question extends Model
{
    protected $table = 'questions';

    protected $fillable = [
        'uuid',
        'curriculum_version_id',
        'subject_id',
        'chapter_id',
        'topic_id',
        'learning_objective_id',
        'question_type',
        'difficulty',
        'marks',
        'stem_markdown',
        'options_json',
        'sub_questions_json',
        'deterministic_answer_key_json',
        'status',
    ];

    protected static function booted(): void
    {
        self::creating(function (Question $question): void {
            if (empty($question->uuid)) {
                $question->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'marks' => 'decimal:2',
            'options_json' => 'array',
            'sub_questions_json' => 'array',
            'deterministic_answer_key_json' => 'array',
        ];
    }

    /**
     * @return HasOne<MarkingRubric, $this>
     */
    public function markingRubric(): HasOne
    {
        return $this->hasOne(MarkingRubric::class, 'question_id');
    }

    /**
     * @return BelongsTo<CurriculumVersion, $this>
     */
    public function curriculumVersion(): BelongsTo
    {
        return $this->belongsTo(CurriculumVersion::class, 'curriculum_version_id');
    }

    /**
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * @return BelongsTo<Chapter, $this>
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function learningObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'learning_objective_id');
    }
}
