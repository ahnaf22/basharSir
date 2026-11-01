'use client';

import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { sendOtpApi } from '@/features/auth/api/auth.api';
import type { ConsentStatus } from '@/features/auth/types/auth.types';
import { ApiClientError } from '@/services/api-client';

export interface GuardianConsentPendingBannerProps {
  consentStatus: ConsentStatus;
  studentCode: string;
  guardianPhoneMasked: string | null;
  guardianPhoneRaw?: string;
}

export function GuardianConsentPendingBanner({
  consentStatus,
  studentCode,
  guardianPhoneMasked,
  guardianPhoneRaw,
}: GuardianConsentPendingBannerProps): React.ReactElement | null {
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (consentStatus === 'verified') {
    return null;
  }

  const handleResendGuardianSms = async (): Promise<void> => {
    if (!guardianPhoneRaw) {
      setFeedback(
        `অভিভাবকের পোর্টালে শিক্ষার্থী কোড (${studentCode}) ব্যবহার করে সম্মতি অনুমোদন করতে বলুন।`
      );
      return;
    }

    setIsSending(true);
    setFeedback(null);
    setErrorText(null);

    try {
      const response = await sendOtpApi({
        phone: guardianPhoneRaw,
        purpose: 'guardian_consent',
      });
      setFeedback(
        `অভিভাবকের মোবাইলে (${response.data.phone_masked}) সম্মতি যাচাইয়ের SMS পুনরায় পাঠানো হয়েছে।`
      );
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorText(error.message);
      } else {
        setErrorText('SMS পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="অভিভাবকের সম্মতি অপেক্ষমাণ"
      data-testid="guardian-consent-pending-banner"
      className="mb-6 rounded-xl border border-accent-warm/40 bg-accent-warm/10 p-4 sm:p-5"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-warm" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-bold text-brand-primary">
                অভিভাবকের সম্মতি অপেক্ষমাণ (PDPA ২০২৬ শিশু সুরক্ষা নীতি)
              </h3>
              <Badge variant="amber">
                {consentStatus === 'withdrawn' ? 'সম্মতি প্রত্যাহারকৃত' : 'অপেক্ষমাণ'}
              </Badge>
            </div>
            <p className="text-sm text-content-secondary">
              বাংলাদেশ ব্যক্তিগত উপাত্ত সুরক্ষা আইন ২০২৬ অনুযায়ী ১৮ বছরের কম বয়সী শিক্ষার্থীর এআই গৃহশিক্ষক ও পরীক্ষা ফিচার চালুর জন্য অভিভাবকের অনুমোদন প্রয়োজন। আপনার শিক্ষার্থী কোড:{' '}
              <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-semibold text-brand-primary">
                {studentCode}
              </span>
              {guardianPhoneMasked ? ` (অভিভাবক: ${guardianPhoneMasked})` : ''}
            </p>
            {feedback && (
              <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-status-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{feedback}</span>
              </p>
            )}
            {errorText && (
              <p className="pt-1 text-xs font-medium text-status-danger">{errorText}</p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isSending}
          onClick={handleResendGuardianSms}
          data-testid="resend-guardian-sms-btn"
          className="shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSending ? 'পাঠানো হচ্ছে...' : 'অভিভাবককে পুনরায় SMS পাঠান'}</span>
        </Button>
      </div>
    </div>
  );
}

