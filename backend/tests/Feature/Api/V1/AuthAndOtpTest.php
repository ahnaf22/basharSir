<?php

declare(strict_types=1);

use App\Modules\Notifications\Services\LogSmsGateway;

it('registers a Bangla Medium student, normalizes BD phone numbers, and dispatches student & guardian OTPs', function (): void {
    /** @var LogSmsGateway $smsGateway */
    $smsGateway = app(LogSmsGateway::class);
    $smsGateway->clearDispatched();

    $response = $this->postJson('/api/v1/auth/register/student', [
        'name_en' => 'Tanvir Ahmed',
        'name_bn' => 'তানভীর আহমেদ',
        'phone' => '০১৭১২৩৪৫৬৭৮',
        'guardian_phone' => '01812345679',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'password' => 'SecurePass123!',
        'school_name' => 'Motijheel Govt. Boys High School',
        'district' => 'Dhaka',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.name_bn', 'তানভীর আহমেদ')
        ->assertJsonPath('data.user.phone', '+8801712345678')
        ->assertJsonPath('data.user.account_type', 'student')
        ->assertJsonPath('data.user.status', 'pending_consent')
        ->assertJsonPath('data.user.student_profile.current_class_level', 8)
        ->assertJsonPath('data.user.student_profile.medium', 'bangla')
        ->assertJsonPath('data.user.student_profile.consent_status', 'pending')
        ->assertJsonPath('data.user.student_profile.guardian_phone_masked', '+88018******79');

    expect($response->json('data.access_token'))->toBeString()->not->toBeEmpty()
        ->and($response->json('data.user.student_profile.student_code'))->toStartWith('STD-')
        ->and($smsGateway->lastOtpFor('+8801712345678'))->toBeString()->toHaveLength(6)
        ->and($smsGateway->lastOtpFor('+8801812345679'))->toBeString()->toHaveLength(6);
});

it('registers a guardian account and verifies phone via 6-digit OTP', function (): void {
    /** @var LogSmsGateway $smsGateway */
    $smsGateway = app(LogSmsGateway::class);
    $smsGateway->clearDispatched();

    $registerResponse = $this->postJson('/api/v1/auth/register/guardian', [
        'name_en' => 'Rafiqul Islam',
        'name_bn' => 'রফিকুল ইসলাম',
        'phone' => '01911223344',
        'relation_type' => 'father',
        'password' => 'GuardianPass123!',
        'preferred_language' => 'bn',
        'weekly_report_channel' => 'whatsapp',
    ]);

    $registerResponse->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.account_type', 'guardian')
        ->assertJsonPath('data.user.phone_verified', false)
        ->assertJsonPath('data.user.guardian_profile.relation_type', 'father');

    $otpCode = $smsGateway->lastOtpFor('+8801911223344');
    expect($otpCode)->toBeString();

    $verifyResponse = $this->postJson('/api/v1/auth/otp/verify', [
        'phone' => '01911223344',
        'code' => $otpCode,
        'purpose' => 'phone_verification',
    ]);

    $verifyResponse->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.verified', true)
        ->assertJsonPath('data.user.phone_verified', true);
});

it('enforces BD SMS OTP rate limiting of max 3 requests per 5 minutes per phone number', function (): void {
    $phone = '01611998877';

    for ($i = 0; $i < 3; $i++) {
        $this->postJson('/api/v1/auth/otp/send', [
            'phone' => $phone,
            'purpose' => 'login',
        ])->assertOk();
    }

    $fourthResponse = $this->postJson('/api/v1/auth/otp/send', [
        'phone' => $phone,
        'purpose' => 'login',
    ]);

    $fourthResponse->assertStatus(429)
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'OTP_RATE_LIMIT_EXCEEDED');
});

it('authenticates a student via phone and password, updates profile preferences, and logs out', function (): void {
    $this->postJson('/api/v1/auth/register/student', [
        'name_en' => 'Nusrat Jahan',
        'name_bn' => 'নুসরাত জাহান',
        'phone' => '01511223344',
        'guardian_phone' => '01799887766',
        'current_class_level' => 7,
        'medium' => 'bangla',
        'password' => 'StudentSecret99',
    ])->assertCreated();

    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'phone' => '+8801511223344',
        'password' => 'StudentSecret99',
        'device_name' => 'nextjs-web',
    ]);

    $loginResponse->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.phone', '+8801511223344');

    /** @var string $token */
    $token = $loginResponse->json('data.access_token');

    $meResponse = $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/students/me');

    $meResponse->assertOk()
        ->assertJsonPath('data.student_profile.current_class_level', 7)
        ->assertJsonPath('data.student_profile.daily_study_target_mins', 60);

    $patchResponse = $this->withHeader('Authorization', 'Bearer '.$token)
        ->patchJson('/api/v1/students/me', [
            'daily_study_target_mins' => 90,
            'school_name' => 'Viqarunnisa Noon School',
            'pseudonym' => 'Nusrat_C7',
        ]);

    $patchResponse->assertOk()
        ->assertJsonPath('data.student_profile.daily_study_target_mins', 90)
        ->assertJsonPath('data.student_profile.school_name', 'Viqarunnisa Noon School')
        ->assertJsonPath('data.student_profile.pseudonym', 'Nusrat_C7');

    $logoutResponse = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/auth/logout');

    $logoutResponse->assertOk()
        ->assertJsonPath('data.logged_out', true);
});
