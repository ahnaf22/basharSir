<?php

declare(strict_types=1);

namespace App\Modules\AI\DTOs;

use App\Modules\AI\Models\AiRequest;

final readonly class AiOrchestrationResultData
{
    /**
     * @param  array<string, mixed>  $structuredPayload
     */
    public function __construct(
        public AiRequest $aiRequest,
        public array $structuredPayload,
        public bool $usedFallbackProvider,
        public int $piiRedactedCount,
    ) {}
}
