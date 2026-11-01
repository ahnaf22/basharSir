<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Domain\Enums;

enum EducationStage: string
{
    case Primary = 'primary';
    case LowerSecondary = 'lower_secondary';
    case Secondary = 'secondary';
}
