<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Domain\Enums;

enum CurriculumVersionStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
