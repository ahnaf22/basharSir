<?php

declare(strict_types=1);

namespace App\Modules\AI\Contracts;

use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\DTOs\AiProviderResponseData;

interface AiProviderInterface
{
    public function providerName(): string;

    public function generateStructured(AiProviderRequestData $request): AiProviderResponseData;
}
