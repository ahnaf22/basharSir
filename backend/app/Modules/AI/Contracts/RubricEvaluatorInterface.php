<?php

declare(strict_types=1);

namespace App\Modules\AI\Contracts;

interface RubricEvaluatorInterface
{
    /**
     * Evaluate a student's written or creative answer against a structured marking rubric.
     *
     * @param  array<string, mixed>  $rubric
     * @param  array<string, mixed>  $submission
     * @return array<string, mixed>
     */
    public function evaluateAgainstRubric(array $rubric, array $submission): array;
}
