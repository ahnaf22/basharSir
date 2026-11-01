import { generateIdempotencyKey } from '@/lib/utils';
import type {
  ApiErrorEnvelope,
  ApiMeta,
  ApiPaginatedEnvelope,
  ApiSuccessEnvelope,
} from '@/services/generated/api-types';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: Record<string, unknown> | null;
  public readonly correlationId: string | null;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
    correlationId?: string | null;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details ?? null;
    this.correlationId = params.correlationId ?? null;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  idempotent?: boolean;
  idempotencyKey?: string;
  activeStudentId?: string | null;
  locale?: 'bn-BD' | 'en-US';
}

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
  getActiveStudentId?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private readonly baseUrl: string;
  private getAccessToken: () => string | null;
  private getActiveStudentId: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config?: Partial<ApiClientConfig>) {
    this.baseUrl = (
      config?.baseUrl ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://127.0.0.1:8000/api/v1'
    ).replace(/\/+$/, '');
    this.getAccessToken = config?.getAccessToken ?? (() => null);
    this.getActiveStudentId = config?.getActiveStudentId ?? (() => null);
    this.onUnauthorized = config?.onUnauthorized;
  }

  public configureAuth(callbacks: {
    getAccessToken?: () => string | null;
    getActiveStudentId?: () => string | null;
    onUnauthorized?: () => void;
  }): void {
    if (callbacks.getAccessToken) {
      this.getAccessToken = callbacks.getAccessToken;
    }
    if (callbacks.getActiveStudentId) {
      this.getActiveStudentId = callbacks.getActiveStudentId;
    }
    if (callbacks.onUnauthorized) {
      this.onUnauthorized = callbacks.onUnauthorized;
    }
  }

  public buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(options?: ApiRequestOptions): Headers {
    const headers = new Headers(options?.headers);

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept-Language')) {
      headers.set('Accept-Language', options?.locale ?? 'bn-BD');
    }

    const token = this.getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const activeStudentId = options?.activeStudentId ?? this.getActiveStudentId();
    if (activeStudentId && !headers.has('X-Active-Student-Id')) {
      headers.set('X-Active-Student-Id', activeStudentId);
    }

    if (options?.idempotent || options?.idempotencyKey) {
      headers.set(
        'X-Idempotency-Key',
        options.idempotencyKey ?? generateIdempotencyKey()
      );
    }

    return headers;
  }

  public async request<TData>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = this.buildHeaders(options);

    const serializedBody =
      options?.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body);

    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: serializedBody,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload: unknown = isJson ? await response.json() : null;

    if (!response.ok || (isErrorEnvelope(payload) && !payload.success)) {
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }

      if (isErrorEnvelope(payload)) {
        throw new ApiClientError({
          status: response.status,
          code: payload.error.code,
          message: payload.error.message,
          details: payload.error.details ?? null,
          correlationId: payload.meta?.correlation_id ?? null,
        });
      }

      throw new ApiClientError({
        status: response.status,
        code: `HTTP_${response.status}`,
        message: 'সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        details: null,
        correlationId: response.headers.get('X-Correlation-Id'),
      });
    }

    return payload as ApiSuccessEnvelope<TData>;
  }

  public async requestPaginated<TItem>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiPaginatedEnvelope<TItem>> {
    const response = await this.request<TItem[]>('GET', endpoint, options);
    return response as unknown as ApiPaginatedEnvelope<TItem>;
  }

  public get<TData>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    return this.request<TData>('GET', endpoint, options);
  }

  public post<TData>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    return this.request<TData>('POST', endpoint, { ...options, body });
  }

  public patch<TData>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    return this.request<TData>('PATCH', endpoint, { ...options, body });
  }

  public put<TData>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    return this.request<TData>('PUT', endpoint, { ...options, body });
  }

  public delete<TData>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiSuccessEnvelope<TData>> {
    return this.request<TData>('DELETE', endpoint, options);
  }
}

function isErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return candidate.success === false && typeof candidate.error === 'object' && candidate.error !== null;
}

export const apiClient = new ApiClient();
export type { ApiMeta, ApiSuccessEnvelope, ApiPaginatedEnvelope, ApiErrorEnvelope };

