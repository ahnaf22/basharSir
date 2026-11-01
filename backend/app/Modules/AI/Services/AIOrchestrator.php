<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\DTOs\AiOrchestrationResultData;
use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\Models\AiRequest;
use App\Modules\AI\Models\PromptVersion;
use App\Modules\AI\Models\UsageLedger;
use App\Modules\AI\Providers\DeterministicCurriculumAiProvider;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

final class AIOrchestrator
{
    private const USD_TO_BDT_RATE = 120.0;

    public function __construct(
        private readonly PiiScrubberService $piiScrubber,
        private readonly AiProviderInterface $primaryProvider,
        private readonly DeterministicCurriculumAiProvider $fallbackProvider,
    ) {}

    /**
     * Dispatch a curriculum-grounded AI request with mandatory PDPA 2026 PII scrubbing,
     * provider failover, external URL sanitization, and usage ledger accounting.
     *
     * @param  array<string, mixed>  $structuredContext
     */
    public function dispatch(
        string $aiService,
        string $systemPrompt,
        string $userPrompt,
        ?StudentProfile $student = null,
        string $modelTier = 'frontier',
        array $structuredContext = [],
    ): AiOrchestrationResultData {
        $knownLiterals = [];
        if ($student !== null) {
            $student->loadMissing('user');
            $knownLiterals = [
                $student->user->name_en,
                $student->user->name_bn,
                $student->user->phone,
                $student->user->email,
                $student->school_name,
                $student->student_code,
            ];
        }

        $scrubbedSystem = $this->piiScrubber->scrub($systemPrompt, $knownLiterals);
        $scrubbedUser = $this->piiScrubber->scrub($userPrompt, $knownLiterals);
        $totalPiiRedacted = $scrubbedSystem->redactedCount + $scrubbedUser->redactedCount;
        $combinedPromptHash = hash('sha256', $scrubbedSystem->sanitizedText."\n---\n".$scrubbedUser->sanitizedText);

        $providerRequest = new AiProviderRequestData(
            aiService: $aiService,
            systemPrompt: $scrubbedSystem->sanitizedText,
            userPrompt: $scrubbedUser->sanitizedText,
            modelTier: $modelTier,
            structuredContext: $structuredContext,
        );

        $usedFallback = false;
        $errorCode = null;

        try {
            $providerResponse = $this->primaryProvider->generateStructured($providerRequest);
        } catch (Throwable $exception) {
            $usedFallback = true;
            $errorCode = mb_substr($exception->getMessage(), 0, 100);
            $providerResponse = $this->fallbackProvider->generateStructured($providerRequest);
        }

        $sanitizedPayload = $this->sanitizePayloadUrls($providerResponse->structuredPayload);
        $costBdt = round($providerResponse->estimatedCostUsd * self::USD_TO_BDT_RATE, 4);

        /** @var AiRequest $aiRequest */
        $aiRequest = DB::transaction(function () use (
            $student,
            $aiService,
            $modelTier,
            $systemPrompt,
            $combinedPromptHash,
            $totalPiiRedacted,
            $providerResponse,
            $costBdt,
            $usedFallback,
            $errorCode
        ): AiRequest {
            $promptVersion = PromptVersion::query()->firstOrCreate(
                [
                    'service_name' => $aiService,
                    'is_active' => true,
                ],
                [
                    'version_code' => strtoupper($aiService).'-v1.0',
                    'system_prompt_template' => mb_substr($systemPrompt, 0, 1000),
                    'model_tier' => $modelTier,
                ]
            );

            $requestRecord = AiRequest::query()->create([
                'student_id' => $student?->id,
                'ai_service' => $aiService,
                'provider' => $providerResponse->providerName,
                'model_name' => $providerResponse->modelName,
                'prompt_version_id' => $promptVersion->id,
                'sanitized_prompt_hash' => $combinedPromptHash,
                'pii_redacted_count' => $totalPiiRedacted,
                'input_tokens' => $providerResponse->inputTokens,
                'output_tokens' => $providerResponse->outputTokens,
                'estimated_cost_usd' => number_format($providerResponse->estimatedCostUsd, 6, '.', ''),
                'estimated_cost_bdt' => number_format($costBdt, 4, '.', ''),
                'latency_ms' => $providerResponse->latencyMs,
                'status' => $usedFallback ? 'fallback_used' : 'completed',
                'error_code' => $errorCode,
            ]);

            if ($student !== null) {
                $today = Carbon::today()->toDateString();
                /** @var UsageLedger|null $ledger */
                $ledger = UsageLedger::query()
                    ->where('student_id', $student->id)
                    ->whereDate('usage_date', $today)
                    ->lockForUpdate()
                    ->first();

                $isOcrCall = $aiService === 'handwriting_ocr';

                if ($ledger === null) {
                    UsageLedger::query()->create([
                        'student_id' => $student->id,
                        'usage_date' => $today,
                        'ai_turns_used' => $isOcrCall ? 0 : 1,
                        'script_ocr_used' => $isOcrCall ? 1 : 0,
                        'total_input_tokens' => $providerResponse->inputTokens,
                        'total_output_tokens' => $providerResponse->outputTokens,
                        'total_cost_bdt' => number_format($costBdt, 4, '.', ''),
                    ]);
                } else {
                    $newCostBdt = round(((float) $ledger->total_cost_bdt) + $costBdt, 4);
                    $ledger->update([
                        'ai_turns_used' => $ledger->ai_turns_used + ($isOcrCall ? 0 : 1),
                        'script_ocr_used' => $ledger->script_ocr_used + ($isOcrCall ? 1 : 0),
                        'total_input_tokens' => $ledger->total_input_tokens + $providerResponse->inputTokens,
                        'total_output_tokens' => $ledger->total_output_tokens + $providerResponse->outputTokens,
                        'total_cost_bdt' => number_format($newCostBdt, 4, '.', ''),
                    ]);
                }
            }

            return $requestRecord;
        });

        return new AiOrchestrationResultData(
            aiRequest: $aiRequest,
            structuredPayload: $sanitizedPayload,
            usedFallbackProvider: $usedFallback,
            piiRedactedCount: $totalPiiRedacted,
        );
    }

    /**
     * Recursively strip any external URLs from AI-generated payload strings.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizePayloadUrls(array $payload): array
    {
        $sanitized = [];
        foreach ($payload as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = $this->piiScrubber->stripExternalUrls($value);
            } elseif (is_array($value)) {
                /** @var array<string, mixed> $nested */
                $nested = $value;
                $sanitized[$key] = $this->sanitizePayloadUrls($nested);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
