<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Domain\Enums;

enum BloomLevel: string
{
    case Knowledge = 'knowledge';
    case Comprehension = 'comprehension';
    case Application = 'application';
    case HigherOrder = 'higher_order';
}
