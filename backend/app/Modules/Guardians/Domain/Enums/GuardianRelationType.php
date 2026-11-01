<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Domain\Enums;

enum GuardianRelationType: string
{
    case Father = 'father';
    case Mother = 'mother';
    case LegalGuardian = 'legal_guardian';
}
