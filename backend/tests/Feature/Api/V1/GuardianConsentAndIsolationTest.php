<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Auth;

it('blocks unconsented minor student from consent-gated routes until guardian approves PDPA 2026 consent, and re-blocks on revocation', function (): void {
    $studentResponse = $this->postJson('/api/v1/auth/register/student', [
        'name_en' => 'Arif Hossain',
        'name_bn' => 'আরিফ হোসেন',
        'phone' => '01711000001',
        'guardian_phone' => '01811000002',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'password' => 'StudentPass123!',
    ])->assertCreated();

    /** @var string $studentToken */
    $studentToken = $studentResponse->json('data.access_token');
    /** @var string $studentCode */
    $studentCode = $studentResponse->json('data.user.student_profile.student_code');

    // 1. Unconsented minor is blocked by EnsureMinorConsentVerifiedMiddleware
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$studentToken)
        ->getJson('/api/v1/students/me/consent-gate')
        ->assertStatus(403)
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'GUARDIAN_CONSENT_REQUIRED')
        ->assertJsonPath('error.details.consent_status', 'pending')
        ->assertJsonPath('error.details.guardian_phone_masked', '+88018******02');

    // 2. Guardian registers with the invited phone number
    Auth::forgetGuards();
    $guardianResponse = $this->postJson('/api/v1/auth/register/guardian', [
        'name_en' => 'Kamal Hossain',
        'name_bn' => 'কামাল হোসেন',
        'phone' => '01811000002',
        'relation_type' => 'father',
        'password' => 'GuardianPass123!',
    ])->assertCreated();

    /** @var string $guardianToken */
    $guardianToken = $guardianResponse->json('data.access_token');

    // 3. Guardian lists linked/invited children
    Auth::forgetGuards();
    $listResponse = $this->withHeader('Authorization', 'Bearer '.$guardianToken)
        ->getJson('/api/v1/guardians/children');

    $listResponse->assertOk()
        ->assertJsonCount(1, 'data.children')
        ->assertJsonPath('data.children.0.link_status', 'invited')
        ->assertJsonPath('data.children.0.student.student_code', $studentCode);

    // 4. Guardian approves PDPA 2026 consent
    Auth::forgetGuards();
    $approveResponse = $this->withHeader('Authorization', 'Bearer '.$guardianToken)
        ->postJson('/api/v1/guardians/consent/approve', [
            'student_code' => $studentCode,
            'ai_tutoring' => true,
            'handwritten_ocr' => true,
            'group_study' => false,
            'verification_method' => 'otp_sms',
        ]);

    $approveResponse->assertOk()
        ->assertJsonPath('data.child.link_status', 'verified')
        ->assertJsonPath('data.child.student.consent_status', 'verified')
        ->assertJsonPath('data.consent_record.policy_version', 'PDPA-2026-v1')
        ->assertJsonPath('data.consent_record.consent_scope.ai_tutoring', true);

    // 5. Student now passes the PDPA 2026 minor consent gate
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$studentToken)
        ->getJson('/api/v1/students/me/consent-gate')
        ->assertOk()
        ->assertJsonPath('data.consent_verified', true)
        ->assertJsonPath('data.consent_status', 'verified');

    // 6. Guardian revokes consent -> Student is immediately blocked again
    Auth::forgetGuards();
    $revokeResponse = $this->withHeader('Authorization', 'Bearer '.$guardianToken)
        ->postJson('/api/v1/guardians/consent/revoke', [
            'student_code' => $studentCode,
        ]);

    $revokeResponse->assertOk()
        ->assertJsonPath('data.child.link_status', 'revoked')
        ->assertJsonPath('data.child.student.consent_status', 'withdrawn');

    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$studentToken)
        ->getJson('/api/v1/students/me/consent-gate')
        ->assertStatus(403)
        ->assertJsonPath('error.code', 'GUARDIAN_CONSENT_REQUIRED')
        ->assertJsonPath('error.details.consent_status', 'withdrawn');
});

it('enforces strict StudentOwnershipPolicy cross-tenant 403 isolation between students and unrelated guardians', function (): void {
    // Register Student A and Guardian A
    $studentAResponse = $this->postJson('/api/v1/auth/register/student', [
        'name_en' => 'Student One',
        'name_bn' => 'শিক্ষার্থী এক',
        'phone' => '01722000001',
        'guardian_phone' => '01822000002',
        'current_class_level' => 6,
        'medium' => 'bangla',
        'password' => 'PassStudentA1!',
    ])->assertCreated();

    /** @var string $studentAToken */
    $studentAToken = $studentAResponse->json('data.access_token');
    /** @var string $studentACode */
    $studentACode = $studentAResponse->json('data.user.student_profile.student_code');

    $guardianAResponse = $this->postJson('/api/v1/auth/register/guardian', [
        'name_en' => 'Guardian One',
        'phone' => '01822000002',
        'relation_type' => 'mother',
        'password' => 'PassGuardianA1!',
    ])->assertCreated();

    /** @var string $guardianAToken */
    $guardianAToken = $guardianAResponse->json('data.access_token');

    // Register Student B and unrelated Guardian B
    $studentBResponse = $this->postJson('/api/v1/auth/register/student', [
        'name_en' => 'Student Two',
        'name_bn' => 'শিক্ষার্থী দুই',
        'phone' => '01733000003',
        'guardian_phone' => '01833000004',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'password' => 'PassStudentB1!',
    ])->assertCreated();

    /** @var string $studentBToken */
    $studentBToken = $studentBResponse->json('data.access_token');

    $guardianBResponse = $this->postJson('/api/v1/auth/register/guardian', [
        'name_en' => 'Guardian Two',
        'phone' => '01833000004',
        'relation_type' => 'father',
        'password' => 'PassGuardianB1!',
    ])->assertCreated();

    /** @var string $guardianBToken */
    $guardianBToken = $guardianBResponse->json('data.access_token');

    // Guardian A approves consent for Student A
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$guardianAToken)
        ->postJson('/api/v1/guardians/consent/approve', [
            'student_code' => $studentACode,
        ])
        ->assertOk();

    // Student A can view own profile (200 OK)
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$studentAToken)
        ->getJson("/api/v1/students/{$studentACode}")
        ->assertOk()
        ->assertJsonPath('data.student_profile.student_code', $studentACode);

    // Verified Guardian A can view Student A's profile (200 OK)
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$guardianAToken)
        ->getJson("/api/v1/students/{$studentACode}")
        ->assertOk()
        ->assertJsonPath('data.student_profile.student_code', $studentACode);

    // Student B is strictly forbidden from viewing Student A's profile (403 FORBIDDEN)
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$studentBToken)
        ->getJson("/api/v1/students/{$studentACode}")
        ->assertStatus(403)
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'FORBIDDEN');

    // Unrelated Guardian B is strictly forbidden from viewing or linking Student A (403)
    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$guardianBToken)
        ->getJson("/api/v1/students/{$studentACode}")
        ->assertStatus(403);

    Auth::forgetGuards();
    $this->withHeader('Authorization', 'Bearer '.$guardianBToken)
        ->postJson('/api/v1/guardians/children/link', [
            'student_code' => $studentACode,
        ])
        ->assertStatus(403)
        ->assertJsonPath('error.code', 'UNAUTHORIZED_CHILD_LINK');
});
