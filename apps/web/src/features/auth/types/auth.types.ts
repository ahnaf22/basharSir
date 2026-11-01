export type AccountType = 'student' | 'guardian' | 'teacher' | 'reviewer' | 'admin';

export type AccountStatus = 'pending_consent' | 'active' | 'suspended' | 'deleted';

export type ConsentStatus = 'pending' | 'verified' | 'withdrawn';

export type EducationMedium = 'bangla' | 'english_version' | 'english_medium' | 'madrasa';

export type GuardianRelationType = 'father' | 'mother' | 'legal_guardian';

export interface StudentProfileDto {
  student_code: string;
  current_class_level: number;
  medium: EducationMedium;
  school_name: string | null;
  district: string | null;
  date_of_birth: string | null;
  consent_status: ConsentStatus;
  daily_study_target_mins: number;
  pseudonym: string | null;
  guardian_phone_masked: string | null;
}

export interface GuardianProfileDto {
  relation_type: GuardianRelationType;
  preferred_language: 'bn' | 'en';
  weekly_report_channel: 'sms' | 'whatsapp' | 'email' | 'push';
}

export interface AuthUserDto {
  uuid: string;
  name_en: string;
  name_bn: string | null;
  phone: string;
  email: string | null;
  account_type: AccountType;
  status: AccountStatus;
  phone_verified: boolean;
  student_profile?: StudentProfileDto | null;
  guardian_profile?: GuardianProfileDto | null;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  access_token: string | null;
}

export interface OtpSendResponseDto {
  phone_masked: string;
  purpose: 'login' | 'phone_verification' | 'guardian_consent';
  expires_in_seconds: number;
  provider_message_id: string;
}

export interface OtpVerifyResponseDto {
  verified: boolean;
  phone: string;
  purpose: string;
  user: AuthUserDto | null;
  access_token: string | null;
}

export interface ConsentScopeDto {
  ai_tutoring: boolean;
  handwritten_ocr: boolean;
  group_study: boolean;
}

export interface ConsentRecordDto {
  id: number;
  policy_version: string;
  consent_scope: ConsentScopeDto;
  verification_method: string;
  consented_at: string;
  withdrawn_at: string | null;
}

export interface LinkedChildDto {
  link_id: number;
  link_status: 'invited' | 'verified' | 'revoked';
  is_primary_payer: boolean;
  verified_at: string | null;
  student: {
    student_id: number;
    user_uuid: string;
    name_en: string;
    name_bn: string | null;
    phone: string;
    student_code: string;
    current_class_level: number;
    medium: EducationMedium;
    school_name: string | null;
    district: string | null;
    consent_status: ConsentStatus;
    daily_study_target_mins: number;
  };
  latest_consent: ConsentRecordDto | null;
}

