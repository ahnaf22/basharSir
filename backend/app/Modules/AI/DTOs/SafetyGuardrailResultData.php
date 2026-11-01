<?php

declare(strict_types=1);

namespace App\Modules\AI\DTOs;

final readonly class SafetyGuardrailResultData
{
    public function __construct(
        public bool $isSafe,
        public bool $isHomeworkShortcutAttempt,
        public ?string $violationCode = null,
        public ?string $redirectMessageBn = null,
    ) {}
}
