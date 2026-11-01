<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Enums;

enum AccountType: string
{
    case Student = 'student';
    case Guardian = 'guardian';
    case Teacher = 'teacher';
    case Reviewer = 'reviewer';
    case Admin = 'admin';
}
