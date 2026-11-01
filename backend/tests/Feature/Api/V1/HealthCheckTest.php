<?php

declare(strict_types=1);

use App\Core\Exceptions\DomainException;
use Illuminate\Support\Facades\Route;

test('GET /api/v1/health returns standardized success envelope and correlation header', function (): void {
    $response = $this->getJson('/api/v1/health', [
        'X-Correlation-Id' => 'req_TEST_CORRELATION_001',
    ]);

    $response->assertOk()
        ->assertHeader('X-Correlation-Id', 'req_TEST_CORRELATION_001')
        ->assertExactJson([
            'success' => true,
            'message' => 'সিস্টেম সচল রয়েছে।',
            'data' => [
                'service' => 'ai-home-tutor-bangladesh-api',
                'api_version' => 'v1',
                'status' => 'healthy',
                'checks' => [
                    'database' => 'up',
                    'cache' => 'up',
                ],
                'timestamp' => $response->json('data.timestamp'),
            ],
            'meta' => [
                'correlation_id' => 'req_TEST_CORRELATION_001',
                'curriculum_version' => 'NCTB-2026-BM-v1.0',
            ],
        ]);
});

test('unknown /api/v1 route returns standardized 404 error envelope', function (): void {
    $response = $this->getJson('/api/v1/non-existent-endpoint');

    $response->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND')
        ->assertJsonStructure([
            'success',
            'error' => ['code', 'message'],
            'meta' => ['correlation_id', 'curriculum_version'],
        ]);
});

test('DomainException renders standardized error envelope with details', function (): void {
    Route::get('/api/v1/_test-domain-error', function (): void {
        throw new DomainException(
            errorCode: 'GUARDIAN_CONSENT_REQUIRED',
            message: 'এই ফিচারটি ব্যবহারের জন্য অভিভাবকের সম্মতি প্রয়োজন।',
            httpStatus: 403,
            details: ['consent_status' => 'pending'],
        );
    });

    $response = $this->getJson('/api/v1/_test-domain-error');

    $response->assertForbidden()
        ->assertJsonPath('success', false)
        ->assertJsonPath('error.code', 'GUARDIAN_CONSENT_REQUIRED')
        ->assertJsonPath('error.details.consent_status', 'pending');
});
