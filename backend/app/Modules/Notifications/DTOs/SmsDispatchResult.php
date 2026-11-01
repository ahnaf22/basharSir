<?php

declare(strict_types=1);

namespace App\Modules\Notifications\DTOs;

final readonly class SmsDispatchResult
{
    public function __construct(
        public bool $delivered,
        public string $providerMessageId,
        public string $channel,
    ) {}
}
