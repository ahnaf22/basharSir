import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';
import type {
  AuthResponseDto,
  AuthUserDto,
  OtpSendResponseDto,
  OtpVerifyResponseDto,
} from '@/features/auth/types/auth.types';
import type {
  GuardianRegistrationValues,
  LoginFormValues,
  StudentRegistrationValues,
} from '@/features/auth/schemas/auth.schema';

export function registerStudentApi(
  payload: StudentRegistrationValues
): Promise<ApiSuccessEnvelope<AuthResponseDto>> {
  return apiClient.post<AuthResponseDto>('/auth/register/student', payload);
}

export function registerGuardianApi(
  payload: GuardianRegistrationValues
): Promise<ApiSuccessEnvelope<AuthResponseDto>> {
  return apiClient.post<AuthResponseDto>('/auth/register/guardian', payload);
}

export function loginApi(
  payload: LoginFormValues
): Promise<ApiSuccessEnvelope<AuthResponseDto>> {
  return apiClient.post<AuthResponseDto>('/auth/login', {
    ...payload,
    device_name: 'nextjs-web',
  });
}

export function sendOtpApi(params: {
  phone: string;
  purpose: 'login' | 'phone_verification' | 'guardian_consent';
}): Promise<ApiSuccessEnvelope<OtpSendResponseDto>> {
  return apiClient.post<OtpSendResponseDto>('/auth/otp/send', params);
}

export function verifyOtpApi(params: {
  phone: string;
  code: string;
  purpose: 'login' | 'phone_verification' | 'guardian_consent';
}): Promise<ApiSuccessEnvelope<OtpVerifyResponseDto>> {
  return apiClient.post<OtpVerifyResponseDto>('/auth/otp/verify', params);
}

export function logoutApi(): Promise<ApiSuccessEnvelope<{ logged_out: boolean }>> {
  return apiClient.post<{ logged_out: boolean }>('/auth/logout');
}

export function fetchMyStudentProfileApi(): Promise<ApiSuccessEnvelope<AuthUserDto>> {
  return apiClient.get<AuthUserDto>('/students/me');
}

export function updateMyStudentProfileApi(payload: {
  current_class_level?: number;
  medium?: 'bangla' | 'english_version';
  school_name?: string;
  district?: string;
  daily_study_target_mins?: number;
  pseudonym?: string;
}): Promise<ApiSuccessEnvelope<AuthUserDto>> {
  return apiClient.patch<AuthUserDto>('/students/me', payload);
}

export function fetchAuthMeApi(): Promise<ApiSuccessEnvelope<import('@/features/auth/types/auth.types').AuthMeResponseDto>> {
  return apiClient.get<import('@/features/auth/types/auth.types').AuthMeResponseDto>('/auth/me');
}

export function fetchEntitlementsApi(): Promise<ApiSuccessEnvelope<import('@/features/auth/types/auth.types').EntitlementsSnapshotDto>> {
  return apiClient.get<import('@/features/auth/types/auth.types').EntitlementsSnapshotDto>('/me/entitlements');
}

