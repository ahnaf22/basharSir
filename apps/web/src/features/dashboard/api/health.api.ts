import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';
import type { HealthCheckData } from '@/services/generated/api-types';

export function fetchSystemHealth(): Promise<ApiSuccessEnvelope<HealthCheckData>> {
  return apiClient.get<HealthCheckData>('/health');
}

