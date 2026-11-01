<?php

declare(strict_types=1);

namespace App\Modules\AI\Providers;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\DTOs\AiProviderResponseData;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class AnthropicProvider implements AiProviderInterface
{
    public function __construct(
        private readonly ?string $apiKey = null,
    ) {}

    public function providerName(): string
    {
        return 'anthropic';
    }

    public function generateStructured(AiProviderRequestData $request): AiProviderResponseData
    {
        $resolvedKey = $this->apiKey ?? (string) config('services.anthropic.api_key', '');
        if ($resolvedKey === '') {
            throw new RuntimeException('ANTHROPIC_API_KEY_MISSING');
        }

        $modelName = $request->modelTier === 'fast' ? 'claude-3-5-haiku-latest' : 'claude-3-7-sonnet-latest';
        $startTime = microtime(true);

        $response = Http::withHeaders([
            'x-api-key' => $resolvedKey,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(25)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $modelName,
                'max_tokens' => 1024,
                'system' => $request->systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $request->userPrompt],
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('ANTHROPIC_HTTP_ERROR_'.$response->status());
        }

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];
        $rawText = (string) data_get($body, 'content.0.text', '{}');
        /** @var array<string, mixed>|null $decoded */
        $decoded = json_decode($rawText, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('ANTHROPIC_INVALID_JSON_RESPONSE');
        }

        $inputTokens = (int) data_get($body, 'usage.input_tokens', 150);
        $outputTokens = (int) data_get($body, 'usage.output_tokens', 120);
        $latencyMs = max(1, (int) round((microtime(true) - $startTime) * 1000));
        $costUsd = round((($inputTokens / 1_000_000) * 3.00) + (($outputTokens / 1_000_000) * 15.00), 6);

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
