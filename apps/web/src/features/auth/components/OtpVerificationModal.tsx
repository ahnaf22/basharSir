'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, X } from 'lucide-react';
import { toAsciiNumerals, toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { sendOtpApi, verifyOtpApi } from '@/features/auth/api/auth.api';
import type { OtpVerifyResponseDto } from '@/features/auth/types/auth.types';
import { ApiClientError } from '@/services/api-client';

export interface OtpVerificationModalProps {
  isOpen: boolean;
  phone: string;
  purpose?: 'login' | 'phone_verification' | 'guardian_consent';
  initialDebugCode?: string | null;
  onVerified: (result: OtpVerifyResponseDto) => void;
  onClose: () => void;
}

export function OtpVerificationModal({
  isOpen,
  phone,
  purpose = 'phone_verification',
  initialDebugCode = null,
  onVerified,
  onClose,
}: OtpVerificationModalProps): React.ReactElement | null {
  const [code, setCode] = useState<string>(initialDebugCode ?? '');
  const [debugCode, setDebugCode] = useState<string | null>(initialDebugCode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const normalizedCode = toAsciiNumerals(code.trim());
    if (!/^[0-9]{6}$/.test(normalizedCode)) {
      setErrorMessage('অনুগ্রহ করে ৬ সংখ্যার ওটিপি (OTP) কোড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyOtpApi({
        phone,
        code: normalizedCode,
        purpose,
      });
      onVerified(response.data);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('ওটিপি যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsResending(true);

    try {
      const response = await sendOtpApi({ phone, purpose });
      if (response.data.debug_code) {
        setDebugCode(response.data.debug_code);
        setCode(response.data.debug_code);
      }
      setStatusMessage(
        `${response.data.phone_masked} নম্বরে নতুন ৬ সংখ্যার ওটিপি পাঠানো হয়েছে।`
      );
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('পুনরায় ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-primary/40 p-4 backdrop-blur-xs"
      data-testid="otp-verification-modal"
    >
      <Card className="w-full max-w-md" elevated>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="otp-modal-title"
                className="font-heading text-lg font-bold text-brand-primary"
              >
                মোবাইল নম্বর ওটিপি (OTP) যাচাইকরণ
              </h2>
              <p className="text-xs text-content-secondary">
                প্রেরিত নম্বর: <span className="font-mono font-medium">{phone}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="rounded-md p-1 text-content-secondary hover:bg-subtle hover:text-content-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {debugCode && (
            <div
              onClick={() => setCode(debugCode)}
              className="cursor-pointer rounded-lg border border-teal-500/30 bg-teal-50/70 p-2.5 text-center text-xs font-medium text-brand-secondary hover:bg-teal-100/60 transition-colors"
            >
              <span className="font-bangla">টেস্টিং ওটিপি কোড: </span>
              <span className="font-mono font-bold tracking-widest text-teal-800">{debugCode}</span>
              <span className="block text-[10px] text-teal-700/80 mt-0.5">(স্বয়ংক্রিয়ভাবে বসাতে ক্লিক করুন)</span>
            </div>
          )}

          <div>
            <label
              htmlFor="otp-code-input"
              className="mb-1.5 block font-heading text-sm font-medium text-content-primary"
            >
              {toBanglaNumerals(6)} সংখ্যার গোপন কোডটি লিখুন
            </label>
            <input
              id="otp-code-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="১২৩৪৫৬ / 123456"
              className="w-full rounded-lg border border-border-subtle bg-canvas px-4 py-2.5 text-center font-mono text-xl tracking-[0.35em] text-content-primary focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
              data-testid="otp-code-input"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs font-medium text-status-danger"
            >
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isResending}
              onClick={handleResend}
              data-testid="otp-resend-button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>পুনরায় ওটিপি পাঠান</span>
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="teal">মেয়াদ {toBanglaNumerals(5)} মিনিট</Badge>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                data-testid="otp-submit-button"
              >
                {isSubmitting ? 'যাচাই হচ্ছে...' : 'ওটিপি যাচাই করুন'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

