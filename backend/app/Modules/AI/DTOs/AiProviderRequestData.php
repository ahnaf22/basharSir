<?php

declare(strict_types=1);

namespace App\Modules\AI\DTOs;

final readonly class AiProviderRequestData
{
    /**
     * @param  array<string, mixed>  $structuredContext
     */
    public function __construct(
        public string $aiService,
        public string $systemPrompt,
        public string $userPrompt,
        public string $modelTier = 'frontier',
        public array $structuredContext = [],
    ) {}
}
