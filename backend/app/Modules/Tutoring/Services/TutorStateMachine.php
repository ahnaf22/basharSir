<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Services;

use App\Modules\Tutoring\DTOs\TutorTransitionResultData;
use App\Modules\Tutoring\Enums\TutorLessonStage;

final class TutorStateMachine
{
    /**
     * Returns the initial metadata state for a newly created TutorSession.
     *
     * @return array<string, mixed>
     */
    public function initialMetadata(): array
    {
        return [
            'consecutive_correct_guided' => 0,
            'hints_used_current_turn' => 0,
            'total_hints_used' => 0,
            'mini_assessment_attempted' => 0,
            'mini_assessment_correct' => 0,
            'prerequisite_passed' => false,
            'questions_attempted' => 0,
            'questions_correct' => 0,
            'misconceptions_logged' => [],
        ];
    }

    /**
     * Deterministically resolves the next TutorLessonStage based on current stage,
     * student action, answer correctness, and backend pedagogical invariants.
     *
     * @param  array<string, mixed>  $currentMetadata
     */
    public function resolveNextStage(
        TutorLessonStage $currentStage,
        string $studentActionType,
        ?bool $isAnswerCorrect,
        ?string $misconceptionCode,
        array $currentMetadata,
        ?TutorLessonStage $llmProposedStage = null,
    ): TutorTransitionResultData {
        $metadata = array_merge($this->initialMetadata(), $currentMetadata);

        // 1. Handle 1-click pedagogical actions from the Right Pane
        if ($studentActionType === 'simplify') {
            return new TutorTransitionResultData(
                nextStage: TutorLessonStage::EXPLAIN_CONCEPT,
                updatedMetadata: $metadata,
                wasBlockedByInvariant: false,
            );
        }

        if ($studentActionType === 'example') {
            return new TutorTransitionResultData(
                nextStage: TutorLessonStage::WORKED_EXAMPLE,
                updatedMetadata: $metadata,
                wasBlockedByInvariant: false,
            );
        }

        if ($studentActionType === 'previous_step') {
            $previous = match ($currentStage) {
                TutorLessonStage::WORKED_EXAMPLE, TutorLessonStage::ASK_STUDENT_QUESTION => TutorLessonStage::EXPLAIN_CONCEPT,
                TutorLessonStage::INCREASE_DIFFICULTY => TutorLessonStage::WORKED_EXAMPLE,
                default => TutorLessonStage::EXPLAIN_CONCEPT,
            };

            return new TutorTransitionResultData(
                nextStage: $previous,
                updatedMetadata: $metadata,
                wasBlockedByInvariant: false,
            );
        }

        if ($studentActionType === 'hint') {
            if ($currentStage === TutorLessonStage::MINI_ASSESSMENT) {
                return new TutorTransitionResultData(
                    nextStage: TutorLessonStage::MINI_ASSESSMENT,
                    updatedMetadata: $metadata,
                    wasBlockedByInvariant: true,
                    invariantReason: 'HINTS_DISABLED_DURING_MINI_ASSESSMENT',
                );
            }

            $currentHints = (int) ($metadata['hints_used_current_turn'] ?? 0);
            $totalHints = (int) ($metadata['total_hints_used'] ?? 0);
            $metadata['hints_used_current_turn'] = min(3, $currentHints + 1);
            $metadata['total_hints_used'] = $totalHints + 1;

            return new TutorTransitionResultData(
                nextStage: $currentStage,
                updatedMetadata: $metadata,
                wasBlockedByInvariant: false,
            );
        }

        // 2. Update answer counters if an answer was evaluated on this turn
        if ($isAnswerCorrect !== null) {
            $metadata['questions_attempted'] = ((int) $metadata['questions_attempted']) + 1;
            if ($isAnswerCorrect) {
                $metadata['questions_correct'] = ((int) $metadata['questions_correct']) + 1;
            } elseif ($misconceptionCode !== null && $misconceptionCode !== '') {
                /** @var array<int, string> $existingMisconceptions */
                $existingMisconceptions = is_array($metadata['misconceptions_logged'] ?? null)
                    ? $metadata['misconceptions_logged']
                    : [];
                if (! in_array($misconceptionCode, $existingMisconceptions, true)) {
                    $existingMisconceptions[] = $misconceptionCode;
                }
                $metadata['misconceptions_logged'] = $existingMisconceptions;
            }
        }

        // 3. Stage-specific deterministic transitions
        $resolvedStage = match ($currentStage) {
            TutorLessonStage::START_LESSON => TutorLessonStage::CHECK_PREREQUISITES,

            TutorLessonStage::CHECK_PREREQUISITES => $this->transitionFromPrerequisiteCheck(
                $isAnswerCorrect,
                $metadata
            ),

            TutorLessonStage::TEACH_PREREQUISITE => TutorLessonStage::EXPLAIN_CONCEPT,

            TutorLessonStage::EXPLAIN_CONCEPT => TutorLessonStage::WORKED_EXAMPLE,

            TutorLessonStage::WORKED_EXAMPLE => TutorLessonStage::ASK_STUDENT_QUESTION,

            TutorLessonStage::ASK_STUDENT_QUESTION,
            TutorLessonStage::ASK_SIMILAR_QUESTION => $this->transitionFromGuidedPractice(
                $isAnswerCorrect,
                $metadata
            ),

            TutorLessonStage::IDENTIFY_MISCONCEPTION => TutorLessonStage::EXPLAIN_CORRECTION,

            TutorLessonStage::EXPLAIN_CORRECTION => TutorLessonStage::ASK_SIMILAR_QUESTION,

            TutorLessonStage::INCREASE_DIFFICULTY => $this->transitionFromIncreaseDifficulty(
                $isAnswerCorrect,
                $metadata
            ),

            TutorLessonStage::MINI_ASSESSMENT => $this->transitionFromMiniAssessment(
                $isAnswerCorrect,
                $metadata
            ),

            TutorLessonStage::SAVE_LEARNING_PROGRESS,
            TutorLessonStage::COMPLETED => TutorLessonStage::COMPLETED,
        };

        // 4. Enforce hard backend invariants if LLM or caller proposed a premature stage jump
        $targetStage = $llmProposedStage ?? $resolvedStage;
        $wasBlocked = false;
        $invariantReason = null;

        if ($targetStage === TutorLessonStage::MINI_ASSESSMENT) {
            $consecutiveCorrect = (int) ($metadata['consecutive_correct_guided'] ?? 0);
            if ($consecutiveCorrect < 2) {
                $wasBlocked = true;
                $invariantReason = 'REQUIRES_AT_LEAST_2_CONSECUTIVE_CORRECT_GUIDED_ANSWERS';
                $targetStage = $resolvedStage === TutorLessonStage::MINI_ASSESSMENT
                    ? TutorLessonStage::ASK_STUDENT_QUESTION
                    : $resolvedStage;
            }
        }

        if (
            $targetStage === TutorLessonStage::SAVE_LEARNING_PROGRESS
            || $targetStage === TutorLessonStage::COMPLETED
        ) {
            $miniAttempted = (int) ($metadata['mini_assessment_attempted'] ?? 0);
            $miniCorrect = (int) ($metadata['mini_assessment_correct'] ?? 0);
            $accuracy = $miniAttempted > 0 ? ($miniCorrect / $miniAttempted) : 0.0;

            if ($miniAttempted < 3 || $accuracy < 0.75) {
                $wasBlocked = true;
                $invariantReason = 'REQUIRES_3_MINI_ASSESSMENT_ITEMS_WITH_75_PCT_ACCURACY';
                $targetStage = ($miniAttempted >= 3 && $accuracy < 0.75)
                    ? TutorLessonStage::EXPLAIN_CORRECTION
                    : TutorLessonStage::MINI_ASSESSMENT;
            }
        }

        // Reset per-turn hint counter when advancing to a new question stage
        if ($targetStage !== $currentStage) {
            $metadata['hints_used_current_turn'] = 0;
        }

        return new TutorTransitionResultData(
            nextStage: $targetStage,
            updatedMetadata: $metadata,
            wasBlockedByInvariant: $wasBlocked,
            invariantReason: $invariantReason,
        );
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function transitionFromPrerequisiteCheck(?bool $isCorrect, array &$metadata): TutorLessonStage
    {
        if ($isCorrect === false) {
            $metadata['prerequisite_passed'] = false;

            return TutorLessonStage::TEACH_PREREQUISITE;
        }

        $metadata['prerequisite_passed'] = true;

        return TutorLessonStage::EXPLAIN_CONCEPT;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function transitionFromGuidedPractice(?bool $isCorrect, array &$metadata): TutorLessonStage
    {
        if ($isCorrect === false) {
            $metadata['consecutive_correct_guided'] = 0;

            return TutorLessonStage::IDENTIFY_MISCONCEPTION;
        }

        if ($isCorrect === true) {
            $consecutive = ((int) ($metadata['consecutive_correct_guided'] ?? 0)) + 1;
            $metadata['consecutive_correct_guided'] = $consecutive;

            return $consecutive >= 2
                ? TutorLessonStage::INCREASE_DIFFICULTY
                : TutorLessonStage::ASK_SIMILAR_QUESTION;
        }

        return TutorLessonStage::ASK_STUDENT_QUESTION;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function transitionFromIncreaseDifficulty(?bool $isCorrect, array &$metadata): TutorLessonStage
    {
        if ($isCorrect === false) {
            $metadata['consecutive_correct_guided'] = 0;

            return TutorLessonStage::IDENTIFY_MISCONCEPTION;
        }

        if ($isCorrect === true) {
            $consecutive = ((int) ($metadata['consecutive_correct_guided'] ?? 0)) + 1;
            $metadata['consecutive_correct_guided'] = $consecutive;

            if ($consecutive >= 2) {
                return TutorLessonStage::MINI_ASSESSMENT;
            }
        }

        return TutorLessonStage::ASK_SIMILAR_QUESTION;
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function transitionFromMiniAssessment(?bool $isCorrect, array &$metadata): TutorLessonStage
    {
        if ($isCorrect === null) {
            return TutorLessonStage::MINI_ASSESSMENT;
        }

        $attempted = ((int) ($metadata['mini_assessment_attempted'] ?? 0)) + 1;
        $correct = ((int) ($metadata['mini_assessment_correct'] ?? 0)) + ($isCorrect ? 1 : 0);

        $metadata['mini_assessment_attempted'] = $attempted;
        $metadata['mini_assessment_correct'] = $correct;

        if ($attempted < 3) {
            return TutorLessonStage::MINI_ASSESSMENT;
        }

        $accuracy = $correct / $attempted;
        if ($accuracy >= 0.75) {
            return TutorLessonStage::SAVE_LEARNING_PROGRESS;
        }

        // Failed mini-assessment (< 75% accuracy): reset mini-assessment counters and loop back for remediation
        $metadata['mini_assessment_attempted'] = 0;
        $metadata['mini_assessment_correct'] = 0;
        $metadata['consecutive_correct_guided'] = 1;

        return TutorLessonStage::EXPLAIN_CORRECTION;
    }
}
