'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Compass } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { updateMyStudentProfileApi } from '@/features/auth/api/auth.api';
import { GuardianConsentPendingBanner } from '@/features/auth/components/GuardianConsentPendingBanner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ApiClientError } from '@/services/api-client';

export default function StudentOnboardingPage(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const profile = user?.student_profile;

  const [classLevel, setClassLevel] = useState<number>(
    profile?.current_class_level ?? 8
  );
  const [medium, setMedium] = useState<'bangla' | 'english_version'>(
    profile?.medium === 'english_version' ? 'english_version' : 'bangla'
  );
  const [dailyTargetMins, setDailyTargetMins] = useState<number>(
    profile?.daily_study_target_mins ?? 60
  );
  const [schoolName, setSchoolName] = useState<string>(profile?.school_name ?? '');
  const [pseudonym, setPseudonym] = useState<string>(profile?.pseudonym ?? '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveOnboarding = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response = await updateMyStudentProfileApi({
        current_class_level: classLevel,
        medium,
        daily_study_target_mins: dailyTargetMins,
        school_name: schoolName || undefined,
        pseudonym: pseudonym || undefined,
      });
      updateUser(response.data);
      setStatusMessage(
        'আপনার পাঠ্যক্রম পছন্দ ও দৈনিক পড়ার লক্ষ্যমাত্রা সংরক্ষিত হয়েছে।'
      );
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      title="শিক্ষার্থী অনবোর্ডিং · NCTB ২০২৬ শিক্ষাক্রম"
      subtitle="আপনার শ্রেণি, মাধ্যম এবং দৈনিক অধ্যয়ন লক্ষ্যমাত্রা নির্ধারণ করুন"
    >
      <GuardianConsentPendingBanner
        consentStatus={profile?.consent_status ?? 'pending'}
        studentCode={profile?.student_code ?? 'STD-2026-PENDING'}
        guardianPhoneMasked={profile?.guardian_phone_masked ?? '+88018******79'}
      />

      <Card elevated className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-brand-secondary" />
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-primary">
                পাঠ্যক্রম ও অধ্যয়ন প্রোফাইল কনফিগারেশন
              </h2>
              <p className="text-xs text-content-secondary">
                জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB ২০২৬) অনুযায়ী পাঠ পরিকল্পনা তৈরি হবে
              </p>
            </div>
          </div>
          <Badge variant="navy">NCTB-2026-BM-v1.0</Badge>
        </div>

        <form onSubmit={handleSaveOnboarding} className="space-y-5">
          <div>
            <label className="mb-2 block font-heading text-sm font-semibold text-content-primary">
              ১. আপনার শ্রেণি নির্বাচন করুন (শ্রেণি ৬–৮)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[6, 7, 8].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setClassLevel(grade)}
                  className={`rounded-xl border p-3 text-center font-heading text-sm font-semibold ${
                    classLevel === grade
                      ? 'border-brand-secondary bg-brand-secondary text-white'
                      : 'border-border-subtle bg-subtle text-content-primary hover:bg-canvas'
                  }`}
                >
                  শ্রেণি {toBanglaNumerals(grade)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="onboard-medium"
                className="mb-1 block font-heading text-sm font-semibold text-content-primary"
              >
                ২. শিক্ষার মাধ্যম
              </label>
              <select
                id="onboard-medium"
                value={medium}
                onChange={(e) =>
                  setMedium(e.target.value as 'bangla' | 'english_version')
                }
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
              >
                <option value="bangla">বাংলা মাধ্যম (Bangla Medium)</option>
                <option value="english_version">ইংলিশ ভার্সন (English Version)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="onboard-target"
                className="mb-1 block font-heading text-sm font-semibold text-content-primary"
              >
                ৩. দৈনিক অধ্যয়ন লক্ষ্যমাত্রা (মিনিট)
              </label>
              <select
                id="onboard-target"
                value={dailyTargetMins}
                onChange={(e) => setDailyTargetMins(Number(e.target.value))}
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
              >
                <option value={45}>{toBanglaNumerals(45)} মিনিট / দিন</option>
                <option value={60}>{toBanglaNumerals(60)} মিনিট / দিন</option>
                <option value={90}>{toBanglaNumerals(90)} মিনিট / দিন</option>
                <option value={120}>{toBanglaNumerals(120)} মিনিট / দিন</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="onboard-school"
                className="mb-1 block font-heading text-sm font-medium text-content-primary"
              >
                বিদ্যালয়ের নাম
              </label>
              <input
                id="onboard-school"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="আপনার বিদ্যালয়ের নাম"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="onboard-pseudonym"
                className="mb-1 block font-heading text-sm font-medium text-content-primary"
              >
                লিডারবোর্ড ছদ্মনাম (PDPA নিরাপদ নাম)
              </label>
              <input
                id="onboard-pseudonym"
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="যেমন: গণিত_অভিযাত্রী_৮"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          {statusMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs font-medium text-status-danger">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              className="flex-1"
            >
              পাঠ্যক্রম প্রোফাইল সংরক্ষণ করুন
            </Button>

            {statusMessage && (
              <Link href="/home" className="flex-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  ড্যাশবোর্ডে এগিয়ে যান →
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

