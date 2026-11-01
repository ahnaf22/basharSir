<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Models\User;

final readonly class LogoutAction
{
    public function execute(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
