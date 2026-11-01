<?php

declare(strict_types=1);

namespace App\Modules\AI\DTOs;

final readonly class AiProviderResponseData
{
    /**
     * @param  array<string, mixed>  $structuredPayload
     */
    public function __construct(
        public string $providerName,
        public string $modelName,
        public array $structuredPayload,
        public int $inputTokens,
        public int $outputTokens,
        public float $estimatedCostUsd,
        public int $latencyMs,
    ) {}
}
