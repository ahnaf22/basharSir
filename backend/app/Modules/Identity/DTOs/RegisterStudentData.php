<?php

declare(strict_types=1);

namespace App\Modules\Identity\DTOs;

use App\Modules\Students\Domain\Enums\EducationMedium;

final readonly class RegisterStudentData
{
    public function __construct(
        public string $nameEn,
        public ?string $nameBn,
        public string $phone,
        public string $guardianPhone,
        public int $currentClassLevel,
        public EducationMedium $medium,
        public ?string $password,
        public ?string $email,
        public ?string $schoolName,
        public ?string $district,
        public ?string $dateOfBirth,
        public ?string $ipAddress,
    ) {}
}
