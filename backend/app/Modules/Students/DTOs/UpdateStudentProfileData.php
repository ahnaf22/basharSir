<?php

declare(strict_types=1);

namespace App\Modules\Students\DTOs;

use App\Modules\Students\Domain\Enums\EducationMedium;

final readonly class UpdateStudentProfileData
{
    public function __construct(
        public ?string $nameBn,
        public ?string $nameEn,
        public ?int $currentClassLevel,
        public ?EducationMedium $medium,
        public ?string $schoolName,
        public ?string $district,
        public ?int $dailyStudyTargetMins,
        public ?string $pseudonym,
    ) {}
}
