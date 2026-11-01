'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  registerGuardianApi,
  registerStudentApi,
} from '@/features/auth/api/auth.api';
import { OtpVerificationModal } from '@/features/auth/components/OtpVerificationModal';
import {
  guardianRegistrationSchema,
  studentRegistrationSchema,
} from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ApiClientError } from '@/services/api-client';

export default function RegisterPage(): React.ReactElement {
  const setSession = useAuthStore((state) => state.setSession);

  const [activeTab, setActiveTab] = useState<'student' | 'guardian'>('student');
  const [nameBn, setNameBn] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [guardianPhone, setGuardianPhone] = useState<string>('');
  const [classLevel, setClassLevel] = useState<number>(8);
  const [medium, setMedium] = useState<'bangla' | 'english_version'>('bangla');
  const [schoolName, setSchoolName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [relationType, setRelationType] = useState<
    'father' | 'mother' | 'legal_guardian'
  >('father');
  const [weeklyChannel, setWeeklyChannel] = useState<
    'sms' | 'whatsapp' | 'email' | 'push'
  >('sms');
  const [password, setPassword] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const [otpTargetPhone, setOtpTargetPhone] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setCreatedMessage(null);

    if (activeTab === 'student') {
      const parsed = studentRegistrationSchema.safeParse({
        name_bn: nameBn,
        name_en: nameEn,
        phone,
        guardian_phone: guardianPhone,
        current_class_level: classLevel,
        medium,
        school_name: schoolName || undefined,
        district: district || undefined,
        password,
      });

      if (!parsed.success) {
        setErrorMessage(
          parsed.error.issues[0]?.message ?? 'শিক্ষার্থী ফর্মের তথ্য যাচাই করুন।'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await registerStudentApi(parsed.data);
        setSession(response.data.user, response.data.access_token);
        setCreatedMessage(response.message);
        setOtpTargetPhone(response.data.user.phone);
      } catch (error: unknown) {
        if (error instanceof ApiClientError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('শিক্ষার্থী নিবন্ধনে সমস্যা হয়েছে।');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const parsedGuardian = guardianRegistrationSchema.safeParse({
      name_bn: nameBn,
      name_en: nameEn,
      phone,
      relation_type: relationType,
      weekly_report_channel: weeklyChannel,
      password,
    });

    if (!parsedGuardian.success) {
      setErrorMessage(
        parsedGuardian.error.issues[0]?.message ?? 'অভিভাবক ফর্মের তথ্য যাচাই করুন।'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerGuardianApi(parsedGuardian.data);
      setSession(response.data.user, response.data.access_token);
      setCreatedMessage(response.message);
      setOtpTargetPhone(response.data.user.phone);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('অভিভাবক নিবন্ধনে সমস্যা হয়েছে।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="নতুন অ্যাকাউন্ট নিবন্ধন · AI Home Tutor Bangladesh"
      subtitle="ষষ্ঠ–অষ্টম শ্রেণি (বাংলা মাধ্যম) শিক্ষার্থী এবং অভিভাবক নিবন্ধন"
    >
      <div className="mx-auto max-w-2xl py-4">
        <Card elevated>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-brand-primary">
                অ্যাকাউন্টের ধরন নির্বাচন করুন
              </h2>
              <p className="text-xs text-content-secondary">
                PDPA ২০২৬ অনুযায়ী ১৮ বছরের কম বয়সী শিক্ষার্থীর জন্য অভিভাবকের মোবাইল নম্বর আবশ্যক।
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-border-subtle bg-subtle p-1">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                data-testid="tab-register-student"
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-heading text-xs font-semibold ${
                  activeTab === 'student'
                    ? 'bg-brand-primary text-white'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>শিক্ষার্থী (Student)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guardian')}
                data-testid="tab-register-guardian"
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-heading text-xs font-semibold ${
                  activeTab === 'guardian'
                    ? 'bg-brand-primary text-white'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>অভিভাবক (Guardian)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reg-name-bn"
                  className="mb-1 block font-heading text-sm font-medium text-content-primary"
                >
                  পূর্ণ নাম (বাংলায়)
                </label>
                <input
                  id="reg-name-bn"
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reg-name-en"
                  className="mb-1 block font-heading text-sm font-medium text-content-primary"
                >
                  Full Name (English)
                </label>
                <input
                  id="reg-name-en"
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
                  required
                />
              </div>
            </div>

            {activeTab === 'student' ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="reg-student-phone"
                      className="mb-1 block font-heading text-sm font-medium text-content-primary"
                    >
                      শিক্ষার্থীর মোবাইল নম্বর
                    </label>
                    <input
                      id="reg-student-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-guardian-phone"
                      className="mb-1 block font-heading text-sm font-medium text-content-primary"
                    >
                      অভিভাবকের মোবাইল নম্বর (PDPA সম্মতি)
                    </label>
                    <input
                      id="reg-guardian-phone"
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Class 6-8 & Bangla Medium Onboarding Selector */}
                <div className="rounded-xl border border-border-subtle bg-subtle p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-brand-primary">
                      শ্রেণি ও মাধ্যম নির্বাচন (NCTB ২০২৬ শিক্ষাক্রম)
                    </span>
                    <Badge variant="teal">শ্রেণি ৬–৮ লঞ্চ কোহোর্ট</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {[6, 7, 8].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setClassLevel(grade)}
                        className={`rounded-lg border px-3 py-2.5 text-center font-heading text-sm font-semibold transition-colors ${
                          classLevel === grade
                            ? 'border-brand-secondary bg-brand-secondary text-white'
                            : 'border-border-subtle bg-surface text-content-primary hover:bg-canvas'
                        }`}
                      >
                        শ্রেণি {toBanglaNumerals(grade)} (Class {grade})
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor="reg-medium"
                        className="mb-1 block text-xs font-medium text-content-secondary"
                      >
                        মাধ্যম (Medium)
                      </label>
                      <select
                        id="reg-medium"
                        value={medium}
                        onChange={(e) =>
                          setMedium(e.target.value as 'bangla' | 'english_version')
                        }
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm"
                      >
                        <option value="bangla">বাংলা মাধ্যম (Bangla Medium)</option>
                        <option value="english_version">ইংলিশ ভার্সন</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-school"
                        className="mb-1 block text-xs font-medium text-content-secondary"
                      >
                        বিদ্যালয়ের নাম (ঐচ্ছিক)
                      </label>
                      <input
                        id="reg-school"
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="বিদ্যালয়ের নাম"
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reg-district"
                        className="mb-1 block text-xs font-medium text-content-secondary"
                      >
                        জেলা (District)
                      </label>
                      <input
                        id="reg-district"
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Dhaka"
                        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="reg-guardian-self-phone"
                    className="mb-1 block font-heading text-sm font-medium text-content-primary"
                  >
                    অভিভাবকের মোবাইল নম্বর
                  </label>
                  <input
                    id="reg-guardian-self-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-relation"
                    className="mb-1 block font-heading text-sm font-medium text-content-primary"
                  >
                    শিক্ষার্থীর সাথে সম্পর্ক
                  </label>
                  <select
                    id="reg-relation"
                    value={relationType}
                    onChange={(e) =>
                      setRelationType(
                        e.target.value as 'father' | 'mother' | 'legal_guardian'
                      )
                    }
                    className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
                  >
                    <option value="father">বাবা (Father)</option>
                    <option value="mother">মা (Mother)</option>
                    <option value="legal_guardian">আইনগত অভিভাবক</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-channel"
                    className="mb-1 block font-heading text-sm font-medium text-content-primary"
                  >
                    সাপ্তাহিক রিপোর্ট মাধ্যম
                  </label>
                  <select
                    id="reg-channel"
                    value={weeklyChannel}
                    onChange={(e) =>
                      setWeeklyChannel(
                        e.target.value as 'sms' | 'whatsapp' | 'email' | 'push'
                      )
                    }
                    className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
                  >
                    <option value="sms">SMS বার্তা</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">ইমেইল</option>
                    <option value="push">অ্যাপ নোটিফিকেশন</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="reg-password"
                className="mb-1 block font-heading text-sm font-medium text-content-primary"
              >
                পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড দিন"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 text-sm"
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

            {createdMessage && (
              <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
                {createdMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting
                ? 'অ্যাকাউন্ট তৈরি হচ্ছে...'
                : activeTab === 'student'
                  ? 'শিক্ষার্থী অ্যাকাউন্ট তৈরি করুন ও ওটিপি যাচাই করুন'
                  : 'অভিভাবক অ্যাকাউন্ট তৈরি করুন'}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-4 text-xs text-content-secondary">
            <span>ইতোমধ্যে অ্যাকাউন্ট আছে?</span>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="font-semibold text-brand-primary hover:underline"
              >
                লগইন পাতায় যান
              </Link>
              <Link
                href="/parent/children"
                className="font-semibold text-brand-secondary hover:underline"
              >
                অভিভাবক সম্মতি ও সন্তান ব্যবস্থাপনা পোর্টাল
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {otpTargetPhone && (
        <OtpVerificationModal
          isOpen={true}
          phone={otpTargetPhone}
          purpose="phone_verification"
          onClose={() => setOtpTargetPhone(null)}
          onVerified={(result) => {
            if (result.user) {
              setSession(result.user, result.access_token);
            }
            setOtpTargetPhone(null);
            setCreatedMessage('মোবাইল নম্বর ওটিপি যাচাই সফলভাবে সম্পন্ন হয়েছে।');
          }}
        />
      )}
    </AppShell>
  );
}

