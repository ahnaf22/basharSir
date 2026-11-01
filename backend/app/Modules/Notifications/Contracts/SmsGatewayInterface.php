<?php

declare(strict_types=1);

namespace App\Modules\Notifications\Contracts;

use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Notifications\DTOs\SmsDispatchResult;

interface SmsGatewayInterface
{
    public function sendOtp(string $phone, string $otpCode, OtpPurpose $purpose): SmsDispatchResult;
}
