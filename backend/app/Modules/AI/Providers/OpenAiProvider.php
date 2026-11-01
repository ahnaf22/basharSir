<?php

declare(strict_types=1);

namespace App\Modules\AI\Providers;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\DTOs\AiProviderResponseData;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class OpenAiProvider implements AiProviderInterface
{
    public function __construct(
        private readonly ?string $apiKey = null,
    ) {}

    public function providerName(): string
    {
        return 'openai';
    }

    public function generateStructured(AiProviderRequestData $request): AiProviderResponseData
    {
        $resolvedKey = $this->apiKey ?? (string) config('services.openai.api_key', '');
        if ($resolvedKey === '') {
            throw new RuntimeException('OPENAI_API_KEY_MISSING');
        }

        $modelName = $request->modelTier === 'fast' ? 'gpt-4o-mini' : 'gpt-4o';
        $startTime = microtime(true);

        $response = Http::withToken($resolvedKey)
            ->timeout(25)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $modelName,
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.2,
                'messages' => [
                    ['role' => 'system', 'content' => $request->systemPrompt],
                    ['role' => 'user', 'content' => $request->userPrompt],
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('OPENAI_HTTP_ERROR_'.$response->status());
        }

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];
        $rawText = (string) data_get($body, 'choices.0.message.content', '{}');
        /** @var array<string, mixed>|null $decoded */
        $decoded = json_decode($rawText, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('OPENAI_INVALID_JSON_RESPONSE');
        }

        $inputTokens = (int) data_get($body, 'usage.prompt_tokens', 150);
        $outputTokens = (int) data_get($body, 'usage.completion_tokens', 120);
        $latencyMs = max(1, (int) round((microtime(true) - $startTime) * 1000));
        $costUsd = round((($inputTokens / 1_000_000) * 2.50) + (($outputTokens / 1_000_000) * 10.00), 6);

        return new AiProviderResponseData(
            providerName: $this->providerName(),
            modelName: $modelName,
            structuredPayload: $decoded,
            inputTokens: $inputTokens,
            outputTokens: $outputTokens,
            estimatedCostUsd: $costUsd,
            latencyMs: $latencyMs,
        );
    }
}
