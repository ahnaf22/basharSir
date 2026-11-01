<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Services;

use App\Core\Exceptions\DomainException;
use App\Modules\Evaluation\Services\AnswerEvaluatorService;
use App\Modules\Evaluation\Services\DeterministicObjectiveGrader;
use App\Modules\Examinations\Models\Exam;
use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\Examinations\Models\SubmittedAnswer;
use App\Modules\LearningAnalytics\Services\MasteryCalculationService;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class ExamLifecycleService
{
    public const LATE_SUBMISSION_GRACE_SECONDS = 60;

    public function __construct(
        private readonly DeterministicObjectiveGrader $objectiveGrader,
        private readonly AnswerEvaluatorService $rubricEvaluator,
        private readonly MasteryCalculationService $masteryService,
    ) {}

    /**
     * Starts a timed ExamAttempt for a student.
     */
    public function startAttempt(StudentProfile $student, Exam $exam): ExamAttempt
    {
        $now = Carbon::now();

        return ExamAttempt::query()->create([
            'exam_id' => $exam->id,
            'student_id' => $student->id,
            'status' => 'in_progress',
            'started_at' => $now,
            'expires_at' => $now->copy()->addMinutes($exam->duration_minutes),
            'obtained_marks' => '0.00',
            'percentage_score' => '0.00',
        ]);
    }

    /**
     * Batch autosaves answers during an active exam attempt, enforcing the server-authoritative
     * expiration timer (with a 60-second network grace window).
     *
     * @param  array<int, array<string, mixed>>  $answersPayload
     */
    public function autosaveAnswers(
        ExamAttempt $attempt,
        array $answersPayload,
        ?Carbon $now = null,
    ): ExamAttempt {
        if ($attempt->status !== 'in_progress') {
            throw new DomainException(
                errorCode: 'EXAM_ATTEMPT_ALREADY_SUBMITTED',
                message: 'এই পরীক্ষাটি ইতিমধ্যে জমা দেওয়া হয়েছে।',
                httpStatus: 422,
            );
        }

        $timestamp = $now ?? Carbon::now();
        $graceDeadline = $attempt->expires_at->copy()->addSeconds(self::LATE_SUBMISSION_GRACE_SECONDS);

        if ($timestamp->greaterThan($graceDeadline)) {
            throw new DomainException(
                errorCode: 'EXAM_TIMER_EXPIRED',
                message: 'পরীক্ষার নির্ধারিত সময় শেষ হয়ে গেছে।',
                httpStatus: 422,
            );
        }

        DB::transaction(function () use ($attempt, $answersPayload): void {
            foreach ($answersPayload as $item) {
                $questionId = (int) ($item['question_id'] ?? 0);
                if ($questionId <= 0) {
                    continue;
                }

                SubmittedAnswer::query()->updateOrCreate(
                    [
                        'exam_attempt_id' => $attempt->id,
                        'question_id' => $questionId,
                    ],
                    [
                        'answer_mode' => is_string($item['answer_mode'] ?? null)
                            ? $item['answer_mode']
                            : 'mcq_choice',
                        'selected_option_key' => is_string($item['selected_option_key'] ?? null)
                            ? $item['selected_option_key']
                            : null,
                        'typed_answer_text' => is_string($item['typed_answer_text'] ?? null)
                            ? $item['typed_answer_text']
                            : null,
                        'is_flagged_for_review' => (bool) ($item['is_flagged_for_review'] ?? false),
                        'time_spent_seconds' => max(0, (int) ($item['time_spent_seconds'] ?? 0)),
                    ]
                );
            }
        });

        return $attempt->fresh('submittedAnswers.evaluation') ?? $attempt;
    }

    /**
     * Idempotently submits and grades an ExamAttempt, feeding verified evidence into MasteryCalculationService.
     *
     * @return array{attempt: ExamAttempt, idempotent_replay: bool}
     */
    public function submitAttempt(
        ExamAttempt $attempt,
        ?float $simulatedRubricConfidence = null,
    ): array {
        if ($attempt->status !== 'in_progress') {
            return [
                'attempt' => $attempt->load(['exam', 'submittedAnswers.evaluation', 'submittedAnswers.question']),
                'idempotent_replay' => true,
            ];
        }

        $attempt->loadMissing(['exam', 'student', 'submittedAnswers']);
        $exam = $attempt->exam;
        $student = $attempt->student;

        /** @var array<int, int> $blueprintIds */
        $blueprintIds = is_array($exam->question_blueprint_json['question_ids'] ?? null)
            ? array_map('intval', $exam->question_blueprint_json['question_ids'])
            : [];

        /** @var Collection<int, Question> $questions */
        $questions = Question::query()
            ->with('markingRubric')
            ->whereIn('id', $blueprintIds)
            ->get()
            ->keyBy('id');

        DB::transaction(function () use (
            $attempt,
            $exam,
            $student,
            $questions,
            $simulatedRubricConfidence
        ): void {
            $obtainedMarks = 0.0;
            $hasProvisionalOrFlagged = false;

            /** @var array<int, SubmittedAnswer> $answersByQuestionId */
            $answersByQuestionId = $attempt->submittedAnswers->keyBy('question_id')->all();

            foreach ($questions as $questionId => $question) {
                $submitted = $answersByQuestionId[$questionId] ?? null;

                if ($submitted === null) {
                    $submitted = SubmittedAnswer::query()->create([
                        'exam_attempt_id' => $attempt->id,
                        'question_id' => $questionId,
                        'answer_mode' => $this->objectiveGrader->isObjectiveQuestionType($question->question_type)
                            ? 'mcq_choice'
                            : 'typed_text',
                        'selected_option_key' => null,
                        'typed_answer_text' => null,
                    ]);
                }

                if ($this->objectiveGrader->isObjectiveQuestionType($question->question_type)) {
                    $evaluation = $this->objectiveGrader->evaluate($submitted, $question);
                } else {
                    $evaluation = $this->rubricEvaluator->evaluateAgainstRubric(
                        $submitted,
                        $question,
                        $student,
                        $simulatedRubricConfidence
                    );
                    if ($evaluation->review_status !== 'auto_approved') {
                        $hasProvisionalOrFlagged = true;
                    }
                }

                $awarded = (float) $evaluation->marks_awarded;
                $maxMarks = max(0.01, (float) $evaluation->max_marks);
                $obtainedMarks += $awarded;

                $scoreRatio = max(0.0, min(1.0, $awarded / $maxMarks));
                $sourceType = $exam->exam_type === 'model_board' ? 'model_exam' : 'chapter_exam';

                $this->masteryService->recordEvidence(
                    studentId: $student->id,
                    curriculumVersionId: $exam->curriculum_version_id,
                    learningObjectiveId: $question->learning_objective_id,
                    sourceType: $sourceType,
                    sourceId: $attempt->id,
                    scoreRatio: $scoreRatio,
                    difficulty: $question->difficulty,
                    hintsUsed: 0,
                );
            }

            $totalExamMarks = max(0.01, (float) $exam->total_marks);
            $pctScore = min(100.0, round(($obtainedMarks / $totalExamMarks) * 100.0, 2));

            $attempt->update([
                'status' => $hasProvisionalOrFlagged ? 'provisional_graded' : 'final_graded',
                'submitted_at' => Carbon::now(),
                'obtained_marks' => number_format($obtainedMarks, 2, '.', ''),
                'percentage_score' => number_format($pctScore, 2, '.', ''),
            ]);
        });

        return [
            'attempt' => $attempt->fresh(['exam', 'submittedAnswers.evaluation', 'submittedAnswers.question']) ?? $attempt,
            'idempotent_replay' => false,
        ];
    }
}
