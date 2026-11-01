import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiClientError } from '@/services/api-client';
import type { HealthCheckData } from '@/services/generated/api-types';

describe('ApiClient (/api/v1 envelope & header contract)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends standard headers, Bearer token, X-Active-Student-Id, and X-Idempotency-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'OK',
          data: {
            service: 'ai-home-tutor-bangladesh-api',
            status: 'ok',
            version: 'v1',
            environment: 'testing',
            curriculum_engine: 'NCTB-2026-BM-v1.0',
            timestamp: '2026-11-01T14:00:00Z',
          },
          meta: {
            correlation_id: 'req_test_123',
            curriculum_version: 'NCTB-2026-BM-v1.0',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new ApiClient({
      baseUrl: 'http://127.0.0.1:8000/api/v1',
      getAccessToken: () => 'sanctum_token_abc',
      getActiveStudentId: () => 'student-uuid-01',
    });

    const response = await client.post<HealthCheckData>(
      '/health',
      { ping: true },
      { idempotent: true, idempotencyKey: 'idem-key-001' }
    );

    expect(response.success).toBe(true);
    expect(response.data.curriculum_engine).toBe('NCTB-2026-BM-v1.0');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('http://127.0.0.1:8000/api/v1/health');
    const headers = new Headers(calledInit.headers);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Accept-Language')).toBe('bn-BD');
    expect(headers.get('Authorization')).toBe('Bearer sanctum_token_abc');
    expect(headers.get('X-Active-Student-Id')).toBe('student-uuid-01');
    expect(headers.get('X-Idempotency-Key')).toBe('idem-key-001');
  });

  it('throws strongly-typed ApiClientError on standardized backend error envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'GUARDIAN_CONSENT_REQUIRED',
            message: 'এই ফিচারটি ব্যবহারের জন্য অভিভাবকের সম্মতি প্রয়োজন।',
            details: {
              consent_status: 'pending',
            },
          },
          meta: {
            correlation_id: 'req_err_999',
          },
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new ApiClient({ baseUrl: 'http://127.0.0.1:8000/api/v1' });

    await expect(client.get('/tutor-sessions')).rejects.toMatchObject({
      name: 'ApiClientError',
      status: 403,
      code: 'GUARDIAN_CONSENT_REQUIRED',
      correlationId: 'req_err_999',
    } satisfies Partial<ApiClientError>);
  });
});

