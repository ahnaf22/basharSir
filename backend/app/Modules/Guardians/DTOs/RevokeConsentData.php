<?php

declare(strict_types=1);

namespace App\Modules\Guardians\DTOs;

final readonly class RevokeConsentData
{
    public function __construct(
        public string $studentCode,
        public ?string $ipAddress,
    ) {}
}
