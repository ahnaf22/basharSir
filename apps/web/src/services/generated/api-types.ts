/**
 * Standardized API v1 Envelope & Resource Types matching backend/openapi/openapi-v1.yaml
 * and docs/api/api-conventions.md
 */

export interface ApiMeta {
  correlation_id: string;
  curriculum_version?: string;
}

export interface ApiPaginationMeta extends ApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface ApiSuccessEnvelope<TData> {
  success: true;
  message: string;
  data: TData;
  meta: ApiMeta;
}

export interface ApiPaginatedEnvelope<TItem> {
  success: true;
  message?: string;
  data: TItem[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export interface HealthCheckData {
  service: string;
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  curriculum_engine: string;
  timestamp: string;
}

