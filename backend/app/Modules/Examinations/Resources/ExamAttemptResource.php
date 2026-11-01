<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Resources;

use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\Examinations\Models\SubmittedAnswer;
use App\Modules\QuestionBank\Models\Question;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExamAttempt
 */
final class ExamAttemptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $blueprintIds = is_array($this->exam->question_blueprint_json['question_ids'] ?? null)
            ? array_map('intval', $this->exam->question_blueprint_json['question_ids'])
            : [];

        /** @var Collection<int, Question> $questions */
        $questions = Question::query()
            ->whereIn('id', $blueprintIds)
            ->orderBy('id')
            ->get();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'exam_id' => $this->exam_id,
            'student_id' => $this->student_id,
            'status' => $this->status,
            'started_at' => $this->started_at->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'obtained_marks' => (float) $this->obtained_marks,
            'total_marks' => (float) $this->exam->total_marks,
            'percentage_score' => (float) $this->percentage_score,
            'exam' => [
                'id' => $this->exam->id,
                'title_bn' => $this->exam->title_bn,
                'exam_type' => $this->exam->exam_type,
                'duration_minutes' => $this->exam->duration_minutes,
                'total_marks' => (float) $this->exam->total_marks,
            ],
            'questions' => $questions->map(fn (Question $q): array => [
                'id' => $q->id,
                'question_type' => $q->question_type,
                'difficulty' => $q->difficulty,
                'marks' => (float) $q->marks,
                'stem_markdown' => $q->stem_markdown,
                'options_json' => $q->options_json,
                'sub_questions_json' => $q->sub_questions_json,
            ])->values()->all(),
            'submitted_answers' => $this->submittedAnswers->map(function (SubmittedAnswer $ans): array {
                $eval = $ans->evaluation;

                return [
                    'id' => $ans->id,
                    'question_id' => $ans->question_id,
                    'answer_mode' => $ans->answer_mode,
                    'selected_option_key' => $ans->selected_option_key,
                    'typed_answer_text' => $ans->typed_answer_text,
                    'is_flagged_for_review' => $ans->is_flagged_for_review,
                    'time_spent_seconds' => $ans->time_spent_seconds,
                    'evaluation' => $eval !== null ? [
                        'evaluator_type' => $eval->evaluator_type,
                        'marks_awarded' => (float) $eval->marks_awarded,
                        'max_marks' => (float) $eval->max_marks,
                        'confidence_score' => (float) $eval->confidence_score,
                        'review_status' => $eval->review_status,
                        'step_breakdown_json' => $eval->step_breakdown_json,
                        'feedback_bn' => $eval->feedback_bn,
                        'nctb_citation' => $eval->nctb_citation,
                    ] : null,
                ];
            })->values()->all(),
        ];
    }
}
