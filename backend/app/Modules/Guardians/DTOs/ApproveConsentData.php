<?php

declare(strict_types=1);

namespace App\Modules\Guardians\DTOs;

final readonly class ApproveConsentData
{
    public function __construct(
        public string $studentCode,
        public bool $aiTutoring,
        public bool $handwrittenOcr,
        public bool $groupStudy,
        public string $verificationMethod,
        public ?string $ipAddress,
        public ?string $userAgent,
    ) {}
}
