<?php

declare(strict_types=1);

namespace App\Modules\Identity\DTOs;

final readonly class LoginData
{
    public function __construct(
        public string $phone,
        public string $password,
        public string $deviceName,
    ) {}
}
