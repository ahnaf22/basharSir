<?php

declare(strict_types=1);

namespace App\Modules\Students\Domain\Enums;

enum EducationMedium: string
{
    case Bangla = 'bangla';
    case EnglishVersion = 'english_version';
    case EnglishMedium = 'english_medium';
    case Madrasa = 'madrasa';
}
