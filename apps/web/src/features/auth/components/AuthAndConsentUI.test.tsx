import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChildSwitcher } from '@/components/layout/ChildSwitcher';
import { GuardianConsentPendingBanner } from '@/features/auth/components/GuardianConsentPendingBanner';
import { OtpVerificationModal } from '@/features/auth/components/OtpVerificationModal';
import { bangladeshPhoneSchema } from '@/features/auth/schemas/auth.schema';
import type { LinkedChildDto } from '@/features/auth/types/auth.types';

describe('Auth, OTP, Guardian Consent Banner & Child Switcher UI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes Bengali numeral phone numbers in bangladeshPhoneSchema', () => {
    const parsed = bangladeshPhoneSchema.safeParse('০১৭১২৩৪৫৬৭৮');
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe('+8801712345678');
    }

    const invalid = bangladeshPhoneSchema.safeParse('01112345678');
    expect(invalid.success).toBe(false);
  });

  it('submits normalized 6-digit OTP via OtpVerificationModal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'ওটিপি যাচাই হয়েছে।',
          data: {
            verified: true,
            phone: '+8801712345678',
            purpose: 'phone_verification',
            user: null,
            access_token: 'tok_verified_123',
          },
          meta: { correlation_id: 'req_otp_1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const onVerified = vi.fn();

    render(
      <OtpVerificationModal
        isOpen={true}
        phone="+8801712345678"
        purpose="phone_verification"
        onVerified={onVerified}
        onClose={() => {}}
      />
    );

    const input = screen.getByTestId('otp-code-input');
    fireEvent.change(input, { target: { value: '৬৫৪৩২১' } });
    fireEvent.click(screen.getByTestId('otp-submit-button'));

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: true,
          access_token: 'tok_verified_123',
        })
      );
    });
  });

  it('renders GuardianConsentPendingBanner for pending minor and hides when verified', () => {
    const { rerender } = render(
      <GuardianConsentPendingBanner
        consentStatus="pending"
        studentCode="STD-2026-004812"
        guardianPhoneMasked="+88018******79"
      />
    );

    expect(
      screen.getByTestId('guardian-consent-pending-banner')
    ).toBeInTheDocument();
    expect(screen.getByText('STD-2026-004812')).toBeInTheDocument();

    rerender(
      <GuardianConsentPendingBanner
        consentStatus="verified"
        studentCode="STD-2026-004812"
        guardianPhoneMasked="+88018******79"
      />
    );

    expect(
      screen.queryByTestId('guardian-consent-pending-banner')
    ).not.toBeInTheDocument();
  });

  it('allows guardian to switch between linked children in ChildSwitcher', () => {
    const childrenFixtures: LinkedChildDto[] = [
      {
        link_id: 1,
        link_status: 'verified',
        is_primary_payer: true,
        verified_at: '2026-11-01T12:00:00Z',
        student: {
          student_id: 101,
          user_uuid: 'uuid-1',
          name_en: 'Tanvir Ahmed',
          name_bn: 'তানভীর আহমেদ',
          phone: '+8801711111111',
          student_code: 'STD-2026-000101',
          current_class_level: 8,
          medium: 'bangla',
          school_name: null,
          district: 'Dhaka',
          consent_status: 'verified',
          daily_study_target_mins: 60,
        },
        latest_consent: null,
      },
      {
        link_id: 2,
        link_status: 'invited',
        is_primary_payer: true,
        verified_at: null,
        student: {
          student_id: 102,
          user_uuid: 'uuid-2',
          name_en: 'Nusrat Jahan',
          name_bn: 'নুসরাত জাহান',
          phone: '+8801722222222',
          student_code: 'STD-2026-000102',
          current_class_level: 6,
          medium: 'bangla',
          school_name: null,
          district: 'Dhaka',
          consent_status: 'pending',
          daily_study_target_mins: 60,
        },
        latest_consent: null,
      },
    ];

    const onSelect = vi.fn();

    render(
      <ChildSwitcher
        childrenList={childrenFixtures}
        activeStudentCode="STD-2026-000101"
        onSelectChild={onSelect}
      />
    );

    expect(screen.getByText(/তানভীর আহমেদ/)).toBeInTheDocument();
    expect(screen.getByText(/নুসরাত জাহান/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('child-switch-btn-STD-2026-000102'));
    expect(onSelect).toHaveBeenCalledWith('STD-2026-000102');
  });
});

