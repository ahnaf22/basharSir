<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianRelationType;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Payments\Domain\Models\Payment;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Seeders\SubscriptionPlanSeeder;
use Database\Seeders\NctbCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('Chunk 7.1: provides /auth/me, /me/entitlements, dev OTP debug_code, and sandbox payment confirmation', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(SubscriptionPlanSeeder::class);

    // 1. Dev OTP: in testing environment, sendOtp includes debug_code
    $otpSendRes = $this->postJson('/api/v1/auth/otp/send', [
        'phone' => '+8801712000001',
        'purpose' => 'phone_verification',
    ])->assertOk();

    $debugCode = $otpSendRes->json('data.debug_code');
    expect($debugCode)->not->toBeNull()
        ->and(strlen((string) $debugCode))->toBe(6);

    // Verify OTP using the debug code
    $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '+8801712000001',
        'code' => $debugCode,
        'purpose' => 'phone_verification',
    ])->assertOk()
        ->assertJsonPath('data.verified', true);

    // 2. Create Guardian and Student with linked relationship
    $guardianUser = User::query()->create([
        'name_bn' => 'আফরোজা বেগম',
        'name_en' => 'Afroza Begum',
        'phone' => '+8801712000002',
        'account_type' => 'guardian',
        'status' => 'active',
    ]);
    $guardian = GuardianProfile::query()->create([
        'user_id' => $guardianUser->id,
        'relation_type' => GuardianRelationType::Mother,
    ]);

    $studentUser = User::query()->create([
        'name_bn' => 'তানভীর ইসলাম',
        'name_en' => 'Tanvir Islam',
        'phone' => '+8801712000003',
        'account_type' => 'student',
        'status' => 'active',
    ]);
    $student = StudentProfile::query()->create([
        'user_id' => $studentUser->id,
        'student_code' => 'STU-2026-9002',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
        'guardian_phone_invited' => '+8801712000002',
    ]);

    StudentGuardianLink::query()->create([
        'student_id' => $student->id,
        'guardian_id' => $guardian->id,
        'is_primary_payer' => true,
        'status' => 'verified',
    ]);

    // 3. GET /api/v1/auth/me for student
    $studentMeRes = $this->actingAs($studentUser, 'sanctum')
        ->getJson('/api/v1/auth/me')
        ->assertOk();

    expect($studentMeRes->json('data.user.phone'))->toBe('+8801712000003')
        ->and($studentMeRes->json('data.entitlements.plan.tier'))->toBe('free')
        ->and($studentMeRes->json('data.entitlements.features')['ai_tutor.daily_turns']['quota_limit'])->toBe(15);

    // 4. GET /api/v1/auth/me for guardian
    $guardianMeRes = $this->actingAs($guardianUser, 'sanctum')
        ->getJson('/api/v1/auth/me')
        ->assertOk();

    expect($guardianMeRes->json('data.user.phone'))->toBe('+8801712000002')
        ->and($guardianMeRes->json('data.linked_children'))->toHaveCount(1)
        ->and($guardianMeRes->json('data.linked_children.0.student.student_code'))->toBe('STU-2026-9002');

    // 5. GET /api/v1/me/entitlements
    $entitlementsRes = $this->actingAs($studentUser, 'sanctum')
        ->getJson('/api/v1/me/entitlements')
        ->assertOk();

    $studentFeatures = $entitlementsRes->json('data.features');
    expect($entitlementsRes->json('data.plan.code'))->toBe('PLAN-FREE-MONTHLY')
        ->and($studentFeatures['materials.pdf_download']['can_access'])->toBeFalse()
        ->and($studentFeatures['teacher_marketplace.booking']['can_access'])->toBeFalse();

    // 6. Initiate Payment & Sandbox Confirmation
    $checkoutRes = $this->actingAs($guardianUser, 'sanctum')
        ->postJson('/api/v1/payments/checkout', [
            'plan_code' => 'PLAN-PREMIUM-MONTHLY',
            'gateway' => 'bkash',
            'idempotency_key' => (string) Str::uuid(),
            'student_code' => $student->student_code,
        ])
        ->assertCreated();

    $paymentUuid = $checkoutRes->json('data.payment_uuid');
    expect($paymentUuid)->not->toBeNull();

    // Sandbox confirm payment
    $sandboxRes = $this->actingAs($guardianUser, 'sanctum')
        ->postJson("/api/v1/payments/{$paymentUuid}/sandbox-confirm")
        ->assertOk();

    expect($sandboxRes->json('data.payment.status'))->toBe('completed')
        ->and($sandboxRes->json('data.subscription.status'))->toBe('active');

    // 7. Verify Student now has Premium Entitlements
    $studentUpdatedEnt = $this->actingAs($studentUser, 'sanctum')
        ->getJson('/api/v1/me/entitlements')
        ->assertOk();

    $updatedFeatures = $studentUpdatedEnt->json('data.features');
    expect($studentUpdatedEnt->json('data.plan.tier'))->toBe('premium')
        ->and($updatedFeatures['ai_tutor.daily_turns']['quota_limit'])->toBe(200)
        ->and($updatedFeatures['materials.pdf_download']['can_access'])->toBeTrue()
        ->and($updatedFeatures['teacher_marketplace.booking']['can_access'])->toBeTrue();
});
