<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Services;

use App\Modules\AI\Services\AIOrchestrator;
use App\Modules\AI\Services\PiiScrubberService;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\LearningAnalytics\Services\MasteryCalculationService;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Tutoring\Enums\TutorLessonStage;
use App\Modules\Tutoring\Models\TutorMessage;
use App\Modules\Tutoring\Models\TutorSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class TutorEngineService
{
    public function __construct(
        private readonly TutorStateMachine $stateMachine,
        private readonly AcademicRagRetriever $ragRetriever,
        private readonly TutorResponseValidator $responseValidator,
        private readonly AIOrchestrator $aiOrchestrator,
        private readonly PiiScrubberService $piiScrubber,
        private readonly MasteryCalculationService $masteryService,
    ) {}

    /**
     * Starts a new TutorSession (or resumes an active one for the same objective)
     * and generates the initial START_LESSON turn if no turns exist yet.
     */
    public function startOrResumeSession(
        StudentProfile $student,
        LearningObjective $objective,
    ): TutorSession {
        $objective->loadMissing('topic.chapter.subject.academicClass');
        $curriculumVersionId = $objective->topic->chapter->subject->academicClass->curriculum_version_id;

        /** @var TutorSession|null $existingActive */
        $existingActive = TutorSession::query()
            ->where('student_id', $student->id)
            ->where('active_objective_id', $objective->id)
            ->whereIn('session_status', ['active', 'paused'])
            ->latest('id')
            ->first();

        if ($existingActive !== null) {
            if ($existingActive->session_status === 'paused') {
                $existingActive->update(['session_status' => 'active']);
            }

            return $existingActive->load(['messages', 'activeObjective', 'topic']);
        }

        /** @var TutorSession $session */
        $session = DB::transaction(function () use ($student, $objective, $curriculumVersionId): TutorSession {
            $newSession = TutorSession::query()->create([
                'student_id' => $student->id,
                'curriculum_version_id' => $curriculumVersionId,
                'topic_id' => $objective->topic_id,
                'active_objective_id' => $objective->id,
                'current_stage' => TutorLessonStage::START_LESSON->value,
                'session_status' => 'active',
                'compact_summary_text' => "পাঠ শুরু: {$objective->title_bn}",
                'state_metadata_json' => $this->stateMachine->initialMetadata(),
                'active_duration_seconds' => 0,
                'started_at' => Carbon::now(),
            ]);

            $ragContext = $this->ragRetriever->buildContext(
                $newSession,
                TutorLessonStage::START_LESSON->value,
                'start_session',
                'পাঠ শুরু করো'
            );

            $orchestration = $this->aiOrchestrator->dispatch(
                aiService: 'tutor_engine',
                systemPrompt: $ragContext->systemPrompt,
                userPrompt: $ragContext->userPrompt,
                student: $student,
                modelTier: 'frontier',
                structuredContext: [
                    'target_stage' => TutorLessonStage::START_LESSON->value,
                    'objective_code' => $objective->code,
                    'objective_title_bn' => $objective->title_bn,
                    'nctb_reference' => $ragContext->nctbReference,
                    'primary_rag_excerpt' => $ragContext->ragChunkTexts[0] ?? $objective->title_bn,
                    'was_answered' => false,
                ]
            );

            $validatedPayload = $this->responseValidator->validateAndNormalize(
                $orchestration->structuredPayload,
                TutorLessonStage::START_LESSON,
                $objective->code,
                $ragContext->nctbReference
            );

            TutorMessage::query()->create([
                'tutor_session_id' => $newSession->id,
                'client_turn_id' => (string) Str::uuid(),
                'sender_role' => 'tutor',
                'lesson_stage' => TutorLessonStage::START_LESSON->value,
                'student_action_type' => 'start_session',
                'structured_payload_json' => $validatedPayload,
                'ai_request_id' => $orchestration->aiRequest->id,
            ]);

            return $newSession;
        });

        return $session->load(['messages', 'activeObjective', 'topic']);
    }

    /**
     * Executes an idempotent student turn within a TutorSession.
     *
     * @return array{session: TutorSession, tutor_message: TutorMessage, mastery_record: MasteryRecord|null, idempotent_replay: bool}
     */
    public function processTurn(
        TutorSession $session,
        string $clientTurnId,
        string $studentActionType,
        ?string $studentInputText = null,
    ): array {
        // 1. Check idempotency: if this client_turn_id was already processed, return the saved response
        /** @var TutorMessage|null $existingMessage */
        $existingMessage = TutorMessage::query()
            ->where('client_turn_id', $clientTurnId)
            ->first();

        if ($existingMessage !== null) {
            /** @var TutorMessage|null $pairedTutorMessage */
            $pairedTutorMessage = TutorMessage::query()
                ->where('tutor_session_id', $session->id)
                ->where('sender_role', 'tutor')
                ->where('id', '>=', $existingMessage->id)
                ->orderBy('id')
                ->first();

            $mastery = MasteryRecord::query()
                ->where('student_id', $session->student_id)
                ->where('curriculum_version_id', $session->curriculum_version_id)
                ->where('learning_objective_id', $session->active_objective_id)
                ->first();

            return [
                'session' => $session->fresh(['messages', 'activeObjective', 'topic']) ?? $session,
                'tutor_message' => $pairedTutorMessage ?? $existingMessage,
                'mastery_record' => $mastery,
                'idempotent_replay' => true,
            ];
        }

        $session->loadMissing(['student', 'activeObjective', 'topic']);
        $currentStage = TutorLessonStage::tryFrom($session->current_stage) ?? TutorLessonStage::START_LESSON;

        // 2. Check Child Safety & Anti-Cheating Homework Integrity guardrails
        if ($studentInputText !== null && trim($studentInputText) !== '') {
            $safetyCheck = $this->piiScrubber->checkSafetyGuardrails($studentInputText);
            if (! $safetyCheck->isSafe || $safetyCheck->isHomeworkShortcutAttempt) {
                $targetStage = $safetyCheck->isHomeworkShortcutAttempt
                    ? TutorLessonStage::ASK_STUDENT_QUESTION
                    : $currentStage;

                $redirectPayload = [
                    'lesson_stage' => $targetStage->value,
                    'pedagogical_step' => $targetStage->pedagogicalRailStep(),
                    'stage_label_bn' => $targetStage->labelBn(),
                    'response_type' => 'safety_redirect',
                    'explanation_bn' => $safetyCheck->redirectMessageBn ?? 'চলো আমরা আবার আজকের পাঠে ফিরে যাই!',
                    'worked_step_latex' => null,
                    'nctb_reference' => 'এনসিটিবি পাঠ্যবই',
                    'evaluation_of_previous_answer' => [
                        'was_answered' => false,
                        'is_correct' => null,
                        'misconception_code' => $safetyCheck->violationCode,
                        'confidence' => 1.0,
                    ],
                    'interactive_question' => [
                        'question_text_bn' => 'বলো তো, এই সমস্যার প্রথম ধাপে কোন সূত্রটি প্রয়োগ করা যায়?',
                        'question_type' => 'short_answer',
                        'difficulty' => 'easy',
                        'expected_answer_canonical' => '(a+b)^2',
                        'accepted_equivalents' => ['(a+b)^2', 'a^2+2ab+b^2'],
                    ],
                    'hints' => [
                        ['level' => 1, 'text_bn' => 'দ্বিপদী রাশির বর্গের সূত্রটি স্মরণ করো।'],
                    ],
                    'expected_learning_objective_code' => $session->activeObjective->code,
                    'allow_hint' => true,
                    'suggested_next_stage' => $targetStage->value,
                ];

                $savedTutorMessage = DB::transaction(function () use (
                    $session,
                    $clientTurnId,
                    $studentActionType,
                    $studentInputText,
                    $targetStage,
                    $redirectPayload
                ): TutorMessage {
                    TutorMessage::query()->create([
                        'tutor_session_id' => $session->id,
                        'client_turn_id' => $clientTurnId,
                        'sender_role' => 'student',
                        'lesson_stage' => $session->current_stage,
                        'student_action_type' => $studentActionType,
                        'student_input_text' => $studentInputText,
                    ]);

                    return TutorMessage::query()->create([
                        'tutor_session_id' => $session->id,
                        'client_turn_id' => (string) Str::uuid(),
                        'sender_role' => 'tutor',
                        'lesson_stage' => $targetStage->value,
                        'student_action_type' => $studentActionType,
                        'structured_payload_json' => $redirectPayload,
                    ]);
                });

                return [
                    'session' => $session->fresh(['messages', 'activeObjective', 'topic']) ?? $session,
                    'tutor_message' => $savedTutorMessage,
                    'mastery_record' => null,
                    'idempotent_replay' => false,
                ];
            }
        }

        // 3. Evaluate student answer if `studentActionType === 'text_reply'` on an interactive question stage
        $evaluationResult = $this->evaluateStudentReplyIfApplicable(
            $session,
            $currentStage,
            $studentActionType,
            $studentInputText
        );

        // 4. Resolve next stage via TutorStateMachine
        $transition = $this->stateMachine->resolveNextStage(
            currentStage: $currentStage,
            studentActionType: $studentActionType,
            isAnswerCorrect: $evaluationResult['is_correct'],
            misconceptionCode: $evaluationResult['misconception_code'],
            currentMetadata: $session->state_metadata_json,
        );

        $nextStage = $transition->nextStage;
        $updatedMetadata = $transition->updatedMetadata;

        // If we reached SAVE_LEARNING_PROGRESS, automatically finalize into COMPLETED
        if ($nextStage === TutorLessonStage::SAVE_LEARNING_PROGRESS) {
            $nextStage = TutorLessonStage::COMPLETED;
        }

        // 5. Build RAG Context (< 3,500 tokens) and invoke AIOrchestrator
        $ragContext = $this->ragRetriever->buildContext(
            $session,
            $nextStage->value,
            $studentActionType,
            $studentInputText
        );

        $orchestration = $this->aiOrchestrator->dispatch(
            aiService: 'tutor_engine',
            systemPrompt: $ragContext->systemPrompt,
            userPrompt: $ragContext->userPrompt,
            student: $session->student,
            modelTier: $studentActionType === 'hint' ? 'fast' : 'frontier',
            structuredContext: [
                'target_stage' => $nextStage->value,
                'objective_code' => $session->activeObjective->code,
                'objective_title_bn' => $session->activeObjective->title_bn,
                'nctb_reference' => $ragContext->nctbReference,
                'primary_rag_excerpt' => $ragContext->ragChunkTexts[0] ?? $session->activeObjective->title_bn,
                'was_answered' => $evaluationResult['was_answered'],
                'is_correct' => $evaluationResult['is_correct'],
                'misconception_code' => $evaluationResult['misconception_code'],
                'student_action_type' => $studentActionType,
            ]
        );

        $validatedPayload = $this->responseValidator->validateAndNormalize(
            $orchestration->structuredPayload,
            $nextStage,
            $session->activeObjective->code,
            $ragContext->nctbReference
        );

        // 6. Persist turn & record verified Mastery evidence inside DB transaction
        /** @var array{tutor_message: TutorMessage, mastery_record: MasteryRecord|null} $persisted */
        $persisted = DB::transaction(function () use (
            $session,
            $clientTurnId,
            $currentStage,
            $nextStage,
            $studentActionType,
            $studentInputText,
            $evaluationResult,
            $updatedMetadata,
            $validatedPayload,
            $orchestration
        ): array {
            $hintsUsedForTurn = (int) ($session->state_metadata_json['hints_used_current_turn'] ?? 0);

            $studentMsg = TutorMessage::query()->create([
                'tutor_session_id' => $session->id,
                'client_turn_id' => $clientTurnId,
                'sender_role' => 'student',
                'lesson_stage' => $currentStage->value,
                'student_action_type' => $studentActionType,
                'student_input_text' => $studentInputText,
                'is_answer_correct' => $evaluationResult['is_correct'],
                'misconception_code' => $evaluationResult['misconception_code'],
                'hints_used_count' => $hintsUsedForTurn,
            ]);

            $tutorMsg = TutorMessage::query()->create([
                'tutor_session_id' => $session->id,
                'client_turn_id' => (string) Str::uuid(),
                'sender_role' => 'tutor',
                'lesson_stage' => $nextStage->value,
                'student_action_type' => $studentActionType,
                'structured_payload_json' => $validatedPayload,
                'is_answer_correct' => $evaluationResult['is_correct'],
                'misconception_code' => $evaluationResult['misconception_code'],
                'hints_used_count' => (int) ($updatedMetadata['hints_used_current_turn'] ?? 0),
                'ai_request_id' => $orchestration->aiRequest->id,
            ]);

            $masteryRecord = null;
            if ($evaluationResult['was_answered'] && $evaluationResult['is_correct'] !== null) {
                $sourceType = match ($currentStage) {
                    TutorLessonStage::START_LESSON,
                    TutorLessonStage::CHECK_PREREQUISITES,
                    TutorLessonStage::TEACH_PREREQUISITE => 'prerequisite_check',
                    TutorLessonStage::MINI_ASSESSMENT => 'mini_assessment',
                    default => 'guided_practice',
                };

                $masteryRecord = $this->masteryService->recordEvidence(
                    studentId: $session->student_id,
                    curriculumVersionId: $session->curriculum_version_id,
                    learningObjectiveId: $session->active_objective_id,
                    sourceType: $sourceType,
                    sourceId: $studentMsg->id,
                    scoreRatio: $evaluationResult['is_correct'] ? 1.0 : 0.0,
                    difficulty: $evaluationResult['difficulty'],
                    hintsUsed: $hintsUsedForTurn,
                );
            }

            $isCompleted = $nextStage === TutorLessonStage::COMPLETED;
            $compactSummary = mb_substr(
                "ধাপ: {$nextStage->value} | প্রশ্ন চেষ্টা: {$updatedMetadata['questions_attempted']} | সঠিক: {$updatedMetadata['questions_correct']}",
                0,
                480
            );

            $session->update([
                'current_stage' => $nextStage->value,
                'session_status' => $isCompleted ? 'completed' : 'active',
                'compact_summary_text' => $compactSummary,
                'state_metadata_json' => $updatedMetadata,
                'completed_at' => $isCompleted ? Carbon::now() : $session->completed_at,
            ]);

            return [
                'tutor_message' => $tutorMsg,
                'mastery_record' => $masteryRecord,
            ];
        });

        $currentMastery = $persisted['mastery_record'] ?? MasteryRecord::query()
            ->where('student_id', $session->student_id)
            ->where('curriculum_version_id', $session->curriculum_version_id)
            ->where('learning_objective_id', $session->active_objective_id)
            ->first();

        return [
            'session' => $session->fresh(['messages', 'activeObjective', 'topic']) ?? $session,
            'tutor_message' => $persisted['tutor_message'],
            'mastery_record' => $currentMastery,
            'idempotent_replay' => false,
        ];
    }

    /**
     * Deterministically evaluates a student's answer against the last tutor message's
     * interactive question expectations (normalizing Bangla numerals and whitespace).
     *
     * @return array{was_answered: bool, is_correct: bool|null, misconception_code: string|null, difficulty: string}
     */
    private function evaluateStudentReplyIfApplicable(
        TutorSession $session,
        TutorLessonStage $currentStage,
        string $studentActionType,
        ?string $studentInputText,
    ): array {
        if ($studentActionType !== 'text_reply' || $studentInputText === null || trim($studentInputText) === '') {
            return [
                'was_answered' => false,
                'is_correct' => null,
                'misconception_code' => null,
                'difficulty' => 'medium',
            ];
        }

        // Pure explanation/non-question transition prompts like "বুঝেছি" or "পরের ধাপে চলো" on EXPLAIN_CONCEPT / WORKED_EXAMPLE
        $normalizedReply = $this->normalizeMathAndBangla($studentInputText);
        $continuePhrases = ['বুঝেছি', 'পরেরধাপেচলো', 'হ্যাঁ', 'ঠিকআছে', 'next', 'continue', 'ok'];
        if (
            in_array($currentStage, [TutorLessonStage::EXPLAIN_CONCEPT, TutorLessonStage::WORKED_EXAMPLE], true)
            && in_array($normalizedReply, $continuePhrases, true)
        ) {
            return [
                'was_answered' => false,
                'is_correct' => null,
                'misconception_code' => null,
                'difficulty' => 'medium',
            ];
        }

        /** @var TutorMessage|null $lastTutorMessage */
        $lastTutorMessage = TutorMessage::query()
            ->where('tutor_session_id', $session->id)
            ->where('sender_role', 'tutor')
            ->latest('id')
            ->first();

        $question = is_array($lastTutorMessage?->structured_payload_json)
            ? ($lastTutorMessage->structured_payload_json['interactive_question'] ?? null)
            : null;

        if (! is_array($question)) {
            return [
                'was_answered' => false,
                'is_correct' => null,
                'misconception_code' => null,
                'difficulty' => 'medium',
            ];
        }

        $difficulty = is_string($question['difficulty'] ?? null) ? $question['difficulty'] : 'medium';
        $canonical = is_string($question['expected_answer_canonical'] ?? null) ? $question['expected_answer_canonical'] : '';
        $equivalents = is_array($question['accepted_equivalents'] ?? null) ? $question['accepted_equivalents'] : [];

        $candidates = array_filter(array_merge([$canonical], array_map('strval', $equivalents)));
        foreach ($candidates as $candidate) {
            if ($normalizedReply === $this->normalizeMathAndBangla($candidate)) {
                return [
                    'was_answered' => true,
                    'is_correct' => true,
                    'misconception_code' => null,
                    'difficulty' => $difficulty,
                ];
            }
        }

        // Detect specific algebraic misconceptions
        $misconceptionCode = 'CONCEPTUAL_CALCULATION_ERROR';
        if (str_contains($normalizedReply, 'x^2') || str_contains($normalizedReply, 'x²') || str_contains($normalizedReply, 'a^2')) {
            if (! str_contains($this->normalizeMathAndBangla($canonical), '^2')) {
                $misconceptionCode = 'ALG_EXPONENT_ADDITION_ON_LIKE_TERMS';
            }
        }

        return [
            'was_answered' => true,
            'is_correct' => false,
            'misconception_code' => $misconceptionCode,
            'difficulty' => $difficulty,
        ];
    }

    private function normalizeMathAndBangla(string $input): string
    {
        $banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $asciiDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $converted = str_replace($banglaDigits, $asciiDigits, $input);
        $converted = str_replace(['²', '³', ' '], ['^2', '^3', ''], $converted);

        return mb_strtolower(trim($converted));
    }
}
