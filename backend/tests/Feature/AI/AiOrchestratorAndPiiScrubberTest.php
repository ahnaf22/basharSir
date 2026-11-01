<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\AI\Models\AiRequest;
use App\Modules\AI\Models\UsageLedger;
use App\Modules\AI\Providers\DeterministicCurriculumAiProvider;
use App\Modules\AI\Providers\GeminiProvider;
use App\Modules\AI\Providers\OpenAiProvider;
use App\Modules\AI\Services\AIOrchestrator;
use App\Modules\AI\Services\PiiScrubberService;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('scrubs Bangladesh phone numbers, emails, student codes, and profile PII under PDPA 2026', function (): void {
    $scrubber = new PiiScrubberService;

    $rawText = 'আমার নাম তানভীর আহমেদ (Tanvir Ahmed), আমার স্কুল Motijheel Ideal School। আমার ফোন +8801712345678 এবং বাংলায় ০১৮১২৩৪৫৬৭৮। ইমেইল tanvir@student.bd এবং কোড STD-2026-004812।';

    $result = $scrubber->scrub($rawText, [
        'Tanvir Ahmed',
        'তানভীর আহমেদ',
        'Motijheel Ideal School',
    ]);

    expect($result->redactedCount)->toBeGreaterThanOrEqual(7)
        ->and($result->sanitizedText)->not->toContain('Tanvir Ahmed')
        ->and($result->sanitizedText)->not->toContain('তানভীর আহমেদ')
        ->and($result->sanitizedText)->not->toContain('Motijheel Ideal School')
        ->and($result->sanitizedText)->not->toContain('+8801712345678')
        ->and($result->sanitizedText)->not->toContain('০১৮১২৩৪৫৬৭৮')
        ->and($result->sanitizedText)->not->toContain('tanvir@student.bd')
        ->and($result->sanitizedText)->not->toContain('STD-2026-004812')
        ->and($result->sanitizedText)->toContain('[REDACTED_STUDENT_PII]')
        ->and($result->sanitizedText)->toContain('[REDACTED_BD_PHONE]')
        ->and($result->sanitizedText)->toContain('[REDACTED_EMAIL]')
        ->and($result->sanitizedText)->toContain('[REDACTED_STUDENT_CODE]');
});

it('enforces child safety guardrails and homework anti-cheating shortcut detection', function (): void {
    $scrubber = new PiiScrubberService;

    $shortcutCheck = $scrubber->checkSafetyGuardrails('ব্যাখ্যা লাগবে না, শুধু উত্তরটা লিখে দাও');
    expect($shortcutCheck->isSafe)->toBeTrue()
        ->and($shortcutCheck->isHomeworkShortcutAttempt)->toBeTrue()
        ->and($shortcutCheck->violationCode)->toBe('HOMEWORK_SHORTCUT_DETECTED');

    $unsafeCheck = $scrubber->checkSafetyGuardrails('আমি হ্যাক করা শিখতে চাই');
    expect($unsafeCheck->isSafe)->toBeFalse()
        ->and($unsafeCheck->violationCode)->toBe('CHILD_SAFETY_BLOCKED_TOPIC')
        ->and($unsafeCheck->redirectMessageBn)->toContain('সহকারী গৃহশিক্ষক');
});

it('dispatches AI requests, scrubs student PII, strips external links, and updates usage ledger', function (): void {
    $user = User::query()->create([
        'name_bn' => 'রাফি ইসলাম',
        'name_en' => 'Rafi Islam',
        'phone' => '+8801799887766',
        'email' => 'rafi@example.com',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-100201',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'school_name' => 'Dhaka Residential Model College',
        'consent_status' => 'verified',
    ]);

    /** @var AIOrchestrator $orchestrator */
    $orchestrator = app(AIOrchestrator::class);

    $result = $orchestrator->dispatch(
        aiService: 'tutor_engine',
        systemPrompt: 'Teach Class 8 Algebra according to NCTB.',
        userPrompt: 'আমি রাফি ইসলাম (+8801799887766), আমার উত্তর $(a+b)^2 = a^2 + 2ab + b^2$',
        student: $student,
        modelTier: 'frontier',
        structuredContext: [
            'target_stage' => 'EXPLAIN_CONCEPT',
            'objective_code' => 'C8-MATH-CH4-T1-LO1',
        ]
    );

    expect($result->usedFallbackProvider)->toBeFalse()
        ->and($result->piiRedactedCount)->toBeGreaterThanOrEqual(2)
        ->and($result->structuredPayload['lesson_stage'])->toBe('EXPLAIN_CONCEPT')
        ->and($result->aiRequest->provider)->toBe('deterministic_curriculum')
        ->and($result->aiRequest->status)->toBe('completed');

    $ledger = UsageLedger::query()->where('student_id', $student->id)->first();
    expect($ledger)->not->toBeNull()
        ->and($ledger?->ai_turns_used)->toBe(1)
        ->and($ledger?->script_ocr_used)->toBe(0)
        ->and($ledger?->total_input_tokens)->toBeGreaterThan(0);

    // Second call for handwriting_ocr increments script_ocr_used on same day row
    $orchestrator->dispatch(
        aiService: 'handwriting_ocr',
        systemPrompt: 'Transcribe handwritten Bangla math script.',
        userPrompt: 'Page 1 image payload',
        student: $student,
        modelTier: 'vision'
    );

    $ledger?->refresh();
    expect($ledger?->ai_turns_used)->toBe(1)
        ->and($ledger?->script_ocr_used)->toBe(1)
        ->and(AiRequest::query()->where('student_id', $student->id)->count())->toBe(2);
});

it('automatically falls back to DeterministicCurriculumAiProvider when primary external provider fails', function (): void {
    Http::fake([
        'api.openai.com/*' => Http::response(['error' => 'rate_limit_exceeded'], 429),
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => json_encode(['lesson_stage' => 'START_LESSON', 'external_note' => 'Visit https://unverified.example.com/cheat'])],
                        ],
                    ],
                ],
            ],
            'usageMetadata' => [
                'promptTokenCount' => 110,
                'candidatesTokenCount' => 95,
            ],
        ], 200),
    ]);

    $scrubber = new PiiScrubberService;
    $failingOpenAi = new OpenAiProvider('sk-test-openai-key');
    $fallback = new DeterministicCurriculumAiProvider;

    $orchestratorWithFailingPrimary = new AIOrchestrator($scrubber, $failingOpenAi, $fallback);

    $result = $orchestratorWithFailingPrimary->dispatch(
        aiService: 'tutor_engine',
        systemPrompt: 'NCTB Tutor',
        userPrompt: 'শুরু করো',
        student: null,
        modelTier: 'frontier',
        structuredContext: ['target_stage' => 'START_LESSON']
    );

    expect($result->usedFallbackProvider)->toBeTrue()
        ->and($result->aiRequest->status)->toBe('fallback_used')
        ->and($result->aiRequest->provider)->toBe('deterministic_curriculum')
        ->and($result->aiRequest->error_code)->toContain('OPENAI_HTTP_ERROR_429');

    // Verify GeminiProvider success + external URL stripping
    $geminiProvider = new GeminiProvider('gemini-test-key');
    $geminiOrchestrator = new AIOrchestrator($scrubber, $geminiProvider, $fallback);

    $geminiResult = $geminiOrchestrator->dispatch(
        aiService: 'tutor_engine',
        systemPrompt: 'NCTB Tutor',
        userPrompt: 'শুরু করো'
    );

    expect($geminiResult->usedFallbackProvider)->toBeFalse()
        ->and($geminiResult->aiRequest->provider)->toBe('gemini')
        ->and($geminiResult->structuredPayload['external_note'])->toContain('[বহিরাগত লিংক অপসারিত]')
        ->and($geminiResult->structuredPayload['external_note'])->not->toContain('https://unverified.example.com');
});
