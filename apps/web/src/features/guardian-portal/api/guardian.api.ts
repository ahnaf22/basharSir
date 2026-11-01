import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';
import type {
  ConsentRecordDto,
  LinkedChildDto,
} from '@/features/auth/types/auth.types';

export function fetchGuardianChildrenApi(): Promise<
  ApiSuccessEnvelope<{ children: LinkedChildDto[] }>
> {
  return apiClient.get<{ children: LinkedChildDto[] }>('/guardians/children');
}

export function linkChildToGuardianApi(payload: {
  student_code?: string;
  student_phone?: string;
  is_primary_payer?: boolean;
}): Promise<ApiSuccessEnvelope<LinkedChildDto>> {
  return apiClient.post<LinkedChildDto>('/guardians/children/link', payload);
}

export function approveMinorConsentApi(payload: {
  student_code: string;
  ai_tutoring: boolean;
  handwritten_ocr: boolean;
  group_study: boolean;
  verification_method?: 'otp_sms' | 'signed_form' | 'guardian_portal';
}): Promise<
  ApiSuccessEnvelope<{
    child: LinkedChildDto;
    consent_record: ConsentRecordDto;
  }>
> {
  return apiClient.post('/guardians/consent/approve', payload);
}

export function revokeMinorConsentApi(payload: {
  student_code: string;
}): Promise<ApiSuccessEnvelope<{ child: LinkedChildDto }>> {
  return apiClient.post('/guardians/consent/revoke', payload);
}

