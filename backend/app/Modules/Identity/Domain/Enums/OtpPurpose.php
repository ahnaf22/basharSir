<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Enums;

enum OtpPurpose: string
{
    case Login = 'login';
    case PhoneVerification = 'phone_verification';
    case GuardianConsent = 'guardian_consent';
}
