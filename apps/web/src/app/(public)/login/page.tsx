'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn, Smartphone } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { loginApi, sendOtpApi } from '@/features/auth/api/auth.api';
import { OtpVerificationModal } from '@/features/auth/components/OtpVerificationModal';
import {
  bangladeshPhoneSchema,
  loginFormSchema,
} from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ApiClientError } from '@/services/api-client';

export default function LoginPage(): React.ReactElement {
  const setSession = useAuthStore((state) => state.setSession);

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpModalPhone, setOtpModalPhone] = useState<string | null>(null);

  const handlePasswordLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsed = loginFormSchema.safeParse({ phone, password });
    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ?? 'তথ্যগুলো সঠিকভাবে পূরণ করুন।'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginApi(parsed.data);
      setSession(response.data.user, response.data.access_token);
      setSuccessMessage('সফলভাবে লগইন সম্পন্ন হয়েছে।');
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLoginTrigger = async (): Promise<void> => {
    setErrorMessage(null);
    const parsedPhone = bangladeshPhoneSchema.safeParse(phone);
    if (!parsedPhone.success) {
      setErrorMessage(
        parsedPhone.error.issues[0]?.message ??
          'ওটিপি পাঠাতে সঠিক বাংলাদেশি মোবাইল নম্বর দিন।'
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendOtpApi({ phone: parsedPhone.data, purpose: 'login' });
      setOtpModalPhone(parsedPhone.data);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell
      title="লগইন · AI Home Tutor Bangladesh"
      subtitle="শিক্ষার্থী ও অভিভাবক অ্যাকাউন্টে প্রবেশ করুন"
    >
      <div className="mx-auto max-w-md py-6">
        <Card elevated>
          <div className="mb-5 space-y-1">
            <h2 className="font-heading text-xl font-bold text-brand-primary">
              আপনার অ্যাকাউন্টে লগইন করুন
            </h2>
            <p className="text-sm text-content-secondary">
              বাংলাদেশি মোবাইল নম্বর ও পাসওয়ার্ড অথবা ওটিপি (OTP) ব্যবহার করুন।
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-phone"
                className="mb-1 block font-heading text-sm font-medium text-content-primary"
              >
                মোবাইল নম্বর
              </label>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX / ০১৭XXXXXXXX"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block font-heading text-sm font-medium text-content-primary"
              >
                পাসওয়ার্ড
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none"
                required
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

            {successMessage && (
              <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
                {successMessage}
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="w-full"
              >
                <LogIn className="h-4 w-4" />
                <span>{isLoading ? 'লগইন হচ্ছে...' : 'পাসওয়ার্ড দিয়ে লগইন'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isLoading}
                onClick={handleOtpLoginTrigger}
                className="w-full"
              >
                <Smartphone className="h-4 w-4" />
                <span>SMS ওটিপি (OTP) দিয়ে লগইন</span>
              </Button>
            </div>
          </form>

          <div className="mt-5 border-t border-border-subtle pt-4 text-center text-xs text-content-secondary">
            নতুন অ্যাকাউন্ট খুলতে চান?{' '}
            <Link
              href="/register"
              className="font-semibold text-brand-secondary hover:underline"
            >
              শিক্ষার্থী বা অভিভাবক নিবন্ধন করুন
            </Link>
          </div>
        </Card>
      </div>

      {otpModalPhone && (
        <OtpVerificationModal
          isOpen={true}
          phone={otpModalPhone}
          purpose="login"
          onClose={() => setOtpModalPhone(null)}
          onVerified={(result) => {
            if (result.user) {
              setSession(result.user, result.access_token);
            }
            setOtpModalPhone(null);
            setSuccessMessage('ওটিপি যাচাইয়ের মাধ্যমে সফলভাবে লগইন হয়েছে।');
          }}
        />
      )}
    </AppShell>
  );
}

