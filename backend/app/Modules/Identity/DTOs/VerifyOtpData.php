<?php

declare(strict_types=1);

namespace App\Modules\Identity\DTOs;

use App\Modules\Identity\Domain\Enums\OtpPurpose;

final readonly class VerifyOtpData
{
    public function __construct(
        public string $phone,
        public string $code,
        public OtpPurpose $purpose,
    ) {}
}
