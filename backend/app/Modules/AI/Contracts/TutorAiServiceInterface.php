<?php

declare(strict_types=1);

namespace App\Modules\AI\Contracts;

interface TutorAiServiceInterface
{
    /**
     * Generate a schema-validated pedagogical tutor response for the given session context.
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function generateTurnResponse(array $context): array;
}
