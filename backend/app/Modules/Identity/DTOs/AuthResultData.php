<?php

declare(strict_types=1);

namespace App\Modules\Identity\DTOs;

use App\Models\User;

final readonly class AuthResultData
{
    public function __construct(
        public User $user,
        public ?string $accessToken,
    ) {}
}
