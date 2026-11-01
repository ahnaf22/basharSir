<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Domain\Enums;

enum GuardianLinkStatus: string
{
    case Invited = 'invited';
    case Verified = 'verified';
    case Revoked = 'revoked';
}
