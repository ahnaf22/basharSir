<?php

declare(strict_types=1);

namespace App\Modules\Identity\DTOs;

use App\Modules\Guardians\Domain\Enums\GuardianRelationType;

final readonly class RegisterGuardianData
{
    public function __construct(
        public string $nameEn,
        public ?string $nameBn,
        public string $phone,
        public GuardianRelationType $relationType,
        public ?string $password,
        public ?string $email,
        public string $preferredLanguage,
        public string $weeklyReportChannel,
        public ?string $ipAddress,
    ) {}
}
