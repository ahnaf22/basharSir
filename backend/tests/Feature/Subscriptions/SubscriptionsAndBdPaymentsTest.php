<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\AI\Models\UsageLedger;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Seeders\SubscriptionPlanSeeder;
use Database\Seeders\NctbCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('initiates idempotent bKash checkout, verifies HMAC webhook, activates subscription, and unlocks student AI quota', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(SubscriptionPlanSeeder::class);

    $guardianUser = User::query()->create([
        'name_bn' => 'সালমা বেগম',
        'name_en' => 'Salma Begum',
        'account_type' => 'guardian',
        'status' => 'active',
        'phone' => '+8801711888111',
        'phone_verified_at' => now(),
        'password' => bcrypt('Secret123!'),
    ]);

    $guardian = GuardianProfile::query()->create([
        'user_id' => $guardianUser->id,
        'relation_type' => 'mother',
        'preferred_language' => 'bn',
    ]);

    $studentUser = User::query()->create([
        'name_bn' => 'নাবিল হাসান',
        'name_en' => 'Nabil Hasan',
        'account_type' => 'student',
        'status' => 'active',
        'phone' => '+8801711888222',
        'phone_verified_at' => now(),
        'password' => bcrypt('Secret123!'),
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STU-2026-0888',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    StudentGuardianLink::query()->create([
        'student_id' => $student->id,
        'guardian_id' => $guardian->id,
        'is_primary_payer' => true,
        'status' => 'verified',
        'verified_at' => now(),
    ]);

    // 1. List plans
    $plansRes = $this->getJson('/api/v1/subscriptions/plans')->assertOk();
    expect($plansRes->json('data.plans'))->toHaveCount(4);

    // 2. Simulate student exhausting Free Tier daily AI turns limit (15 turns)
    UsageLedger::query()->create([
        'student_id' => $student->id,
        'usage_date' => Carbon::today()->toDateString(),
        'ai_turns_used' => 15,
        'script_ocr_used' => 0,
        'total_input_tokens' => 1500,
        'total_output_tokens' => 1500,
        'total_cost_bdt' => 1.5,
    ]);

    $objective = LearningObjective::query()->firstOrFail();

    $studentToken = $studentUser->createToken('student-quota-test')->plainTextToken;
    $startRes = $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->postJson('/api/v1/tutor-sessions', [
            'learning_objective_id' => $objective->id,
        ])->assertCreated();
    $sessionId = (int) $startRes->json('data.id');

    // Attempt to submit an AI turn while Free quota is exhausted -> 429 DAILY_AI_QUOTA_EXCEEDED
    $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => 'turn-quota-blocked-1',
            'action_type' => 'simplify',
            'student_input_text' => 'আরেকটু সহজ করে বোঝাও',
        ])->assertStatus(429)
        ->assertJsonPath('error.code', 'DAILY_AI_QUOTA_EXCEEDED');

    // 3. Guardian initiates idempotent bKash checkout for Premium Plan
    Auth::forgetGuards();
    $guardianToken = $guardianUser->createToken('guardian-checkout-test')->plainTextToken;

    $checkoutRes = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson('/api/v1/payments/checkout', [
            'plan_code' => 'PLAN-PREMIUM-MONTHLY',
            'gateway' => 'bkash',
            'student_code' => $student->student_code,
            'idempotency_key' => 'chk-bkash-001',
        ])->assertCreated();

    $invoiceNo = (string) $checkoutRes->json('data.merchant_invoice_no');
    expect($checkoutRes->json('data.amount_bdt'))->toBe(999);

    // Replay same idempotency_key -> returns identical invoice
    $replayRes = $this->withHeader('Authorization', "Bearer {$guardianToken}")
        ->postJson('/api/v1/payments/checkout', [
            'plan_code' => 'PLAN-PREMIUM-MONTHLY',
            'gateway' => 'bkash',
            'student_code' => $student->student_code,
            'idempotency_key' => 'chk-bkash-001',
        ])->assertCreated();
    expect($replayRes->json('data.merchant_invoice_no'))->toBe($invoiceNo);

    // 4. Reject forged webhook signature
    $webhookPayload = [
        'merchant_invoice_no' => $invoiceNo,
        'gateway_trx_id' => 'BKASH-TRX-998877',
        'status' => 'completed',
    ];

    $this->postJson('/api/v1/webhooks/payments/bkash', $webhookPayload, [
        'X-Webhook-Signature' => 'forged-signature',
    ])->assertStatus(400)
        ->assertJsonPath('error.code', 'INVALID_WEBHOOK_SIGNATURE');

    // 5. Process valid HMAC-signed bKash webhook
    $secret = 'bd-payment-webhook-secret-2026';
    $validSignature = hash_hmac('sha256', "bkash:{$invoiceNo}:BKASH-TRX-998877:completed", $secret);

    $webhookRes = $this->postJson('/api/v1/webhooks/payments/bkash', $webhookPayload, [
        'X-Webhook-Signature' => $validSignature,
    ])->assertOk();

    expect($webhookRes->json('data.payment_status'))->toBe('completed')
        ->and($webhookRes->json('data.already_processed'))->toBeFalse();

    // Replay identical webhook -> idempotent, no duplicate subscription created
    $replayWebhookRes = $this->postJson('/api/v1/webhooks/payments/bkash', $webhookPayload, [
        'X-Webhook-Signature' => $validSignature,
    ])->assertOk();

    expect($replayWebhookRes->json('data.already_processed'))->toBeTrue()
        ->and(Subscription::query()->where('student_id', $student->id)->count())->toBe(1);

    // 6. Student now has Premium quota (200 daily turns) and can submit AI Tutor turn
    Auth::forgetGuards();
    $this->withHeader('Authorization', "Bearer {$studentToken}")
        ->postJson("/api/v1/tutor-sessions/{$sessionId}/turns", [
            'client_turn_id' => (string) Str::uuid(),
            'action_type' => 'simplify',
            'student_input_text' => 'আরেকটু সহজ করে বোঝাও',
        ])->assertOk();
});
