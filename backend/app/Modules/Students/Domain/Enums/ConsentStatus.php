<?php

declare(strict_types=1);

namespace App\Modules\Students\Domain\Enums;

enum ConsentStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Withdrawn = 'withdrawn';
}
