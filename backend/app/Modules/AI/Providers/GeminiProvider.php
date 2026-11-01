<?php

declare(strict_types=1);

namespace App\Modules\AI\Providers;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\DTOs\AiProviderResponseData;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class GeminiProvider implements AiProviderInterface
{
    public function __construct(
        private readonly ?string $apiKey = null,
    ) {}

    public function providerName(): string
    {
        return 'gemini';
    }

    public function generateStructured(AiProviderRequestData $request): AiProviderResponseData
    {
        $resolvedKey = $this->apiKey ?? (string) config('services.gemini.api_key', '');
        if ($resolvedKey === '') {
            throw new RuntimeException('GEMINI_API_KEY_MISSING');
        }

        $modelName = $request->modelTier === 'fast' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
        $startTime = microtime(true);

        $response = Http::timeout(25)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$resolvedKey}", [
                'systemInstruction' => [
                    'parts' => [['text' => $request->systemPrompt]],
                ],
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $request->userPrompt]],
                    ],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.2,
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('GEMINI_HTTP_ERROR_'.$response->status());
        }

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];
        $rawText = (string) data_get($body, 'candidates.0.content.parts.0.text', '{}');
        /** @var array<string, mixed>|null $decoded */
        $decoded = json_decode($rawText, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('GEMINI_INVALID_JSON_RESPONSE');
        }

        $inputTokens = (int) data_get($body, 'usageMetadata.promptTokenCount', 150);
        $outputTokens = (int) data_get($body, 'usageMetadata.candidatesTokenCount', 120);
        $latencyMs = max(1, (int) round((microtime(true) - $startTime) * 1000));

        $costUsd = round((($inputTokens / 1_000_000) * 1.25) + (($outputTokens / 1_000_000) * 5.00), 6);

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
