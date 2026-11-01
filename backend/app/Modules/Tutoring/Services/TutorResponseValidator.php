<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Services;

use App\Modules\Tutoring\Enums\TutorLessonStage;
use InvalidArgumentException;

final class TutorResponseValidator
{
    /**
     * Validates and normalizes an AI provider payload against the strict TutorResponseSchema.
     * Throws InvalidArgumentException if required pedagogical fields are missing or invalid.
     *
     * @param  array<string, mixed>  $rawPayload
     * @return array<string, mixed>
     */
    public function validateAndNormalize(
        array $rawPayload,
        TutorLessonStage $enforcedStage,
        string $expectedObjectiveCode,
        string $fallbackNctbReference,
    ): array {
        $explanationBn = isset($rawPayload['explanation_bn']) && is_string($rawPayload['explanation_bn'])
            ? trim($rawPayload['explanation_bn'])
            : '';

        if ($explanationBn === '') {
            throw new InvalidArgumentException('TUTOR_SCHEMA_MISSING_EXPLANATION_BN');
        }

        $interactiveQuestion = $rawPayload['interactive_question'] ?? null;
        if (! is_array($interactiveQuestion) || empty($interactiveQuestion['question_text_bn'])) {
            throw new InvalidArgumentException('TUTOR_SCHEMA_MISSING_INTERACTIVE_QUESTION');
        }

        $hints = is_array($rawPayload['hints'] ?? null) ? $rawPayload['hints'] : [];
        $normalizedHints = [];
        foreach ($hints as $index => $hint) {
            if (is_array($hint) && isset($hint['text_bn']) && is_string($hint['text_bn'])) {
                $normalizedHints[] = [
                    'level' => (int) ($hint['level'] ?? ($index + 1)),
                    'text_bn' => $hint['text_bn'],
                ];
            }
        }

        $evaluation = is_array($rawPayload['evaluation_of_previous_answer'] ?? null)
            ? $rawPayload['evaluation_of_previous_answer']
            : [
                'was_answered' => false,
                'is_correct' => null,
                'misconception_code' => null,
                'confidence' => null,
            ];

        return [
            'lesson_stage' => $enforcedStage->value,
            'pedagogical_step' => $enforcedStage->pedagogicalRailStep(),
            'stage_label_bn' => $enforcedStage->labelBn(),
            'response_type' => is_string($rawPayload['response_type'] ?? null)
                ? $rawPayload['response_type']
                : 'guided_practice_question',
            'explanation_bn' => $explanationBn,
            'worked_step_latex' => is_string($rawPayload['worked_step_latex'] ?? null)
                ? $rawPayload['worked_step_latex']
                : null,
            'nctb_reference' => is_string($rawPayload['nctb_reference'] ?? null) && $rawPayload['nctb_reference'] !== ''
                ? $rawPayload['nctb_reference']
                : $fallbackNctbReference,
            'evaluation_of_previous_answer' => [
                'was_answered' => (bool) ($evaluation['was_answered'] ?? false),
                'is_correct' => isset($evaluation['is_correct']) ? (bool) $evaluation['is_correct'] : null,
                'misconception_code' => is_string($evaluation['misconception_code'] ?? null)
                    ? $evaluation['misconception_code']
                    : null,
                'confidence' => isset($evaluation['confidence']) ? (float) $evaluation['confidence'] : null,
            ],
            'interactive_question' => [
                'question_text_bn' => (string) $interactiveQuestion['question_text_bn'],
                'question_type' => is_string($interactiveQuestion['question_type'] ?? null)
                    ? $interactiveQuestion['question_type']
                    : 'short_answer',
                'difficulty' => is_string($interactiveQuestion['difficulty'] ?? null)
                    ? $interactiveQuestion['difficulty']
                    : 'medium',
                'expected_answer_canonical' => is_string($interactiveQuestion['expected_answer_canonical'] ?? null)
                    ? $interactiveQuestion['expected_answer_canonical']
                    : '',
                'accepted_equivalents' => is_array($interactiveQuestion['accepted_equivalents'] ?? null)
                    ? array_values(array_map('strval', $interactiveQuestion['accepted_equivalents']))
                    : [],
            ],
            'hints' => $normalizedHints,
            'expected_learning_objective_code' => $expectedObjectiveCode,
            'allow_hint' => $enforcedStage !== TutorLessonStage::MINI_ASSESSMENT
                && $enforcedStage !== TutorLessonStage::COMPLETED,
            'suggested_next_stage' => is_string($rawPayload['suggested_next_stage'] ?? null)
                ? $rawPayload['suggested_next_stage']
                : $enforcedStage->value,
        ];
    }
}
