<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Enums;

enum AccountStatus: string
{
    case PendingConsent = 'pending_consent';
    case Active = 'active';
    case Suspended = 'suspended';
    case Deleted = 'deleted';
}
