<?php

declare(strict_types=1);

namespace App\Modules\AI\DTOs;

final readonly class PiiScrubResultData
{
    public function __construct(
        public string $sanitizedText,
        public int $redactedCount,
        public string $promptHash,
    ) {}
}
