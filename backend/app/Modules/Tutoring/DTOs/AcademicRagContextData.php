<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\DTOs;

final readonly class AcademicRagContextData
{
    /**
     * @param  array<int, string>  $ragChunkTexts
     */
    public function __construct(
        public string $systemPrompt,
        public string $userPrompt,
        public array $ragChunkTexts,
        public string $nctbReference,
        public int $estimatedInputTokens,
    ) {}
}
