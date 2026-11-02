'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  registerGuardianApi,
  registerStudentApi,
  verifyOtpApi,
  sendOtpApi,
} from '@/features/auth/api/auth.api';
import {
  guardianRegistrationSchema,
  studentRegistrationSchema,
} from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ApiClientError } from '@/services/api-client';
import type { AuthUserDto } from '@/features/auth/types/auth.types';

// Convert ASCII numbers to Bangla numerals
const toBn = (s: string | number): string =>
  String(s).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)] ?? d);

// Convert Bangla numerals to English ASCII digits
const toEn = (s: string): string =>
  String(s).replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

const OPS: Record<string, string> = {
  '13': 'গ্রামীণফোন',
  '17': 'গ্রামীণফোন',
  '18': 'রবি',
  '19': 'বাংলালিংক',
  '14': 'বাংলালিংক',
  '16': 'এয়ারটেল',
  '15': 'টেলিটক',
};

const QUIPS = [
  'রেজিস্ট্রেশন করতে মাত্র ১ মিনিট লাগে। চলো শুরু করি!',
  'প্যাঁচ যতই থাকুক, পড়া হবে!',
  'মুখস্থ নয়, বুঝে বুঝে শেখাই আসল পাওয়ার!',
  'কোনো ক্রেডিট কার্ড লাগবে না। ফ্রি ট্রায়াল আজই শুরু।',
];

const BANGLA_DAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  // Flow panes: 'form' | 'otp' | 'done'
  const [pane, setPane] = useState<'form' | 'otp' | 'done'>('form');
  const [activeTab, setActiveTab] = useState<'student' | 'guardian'>('student');

  // Common fields
  const [nameBn, setNameBn] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [phoneOperator, setPhoneOperator] = useState<string>('');

  // Student specific fields
  const [guardianPhone, setGuardianPhone] = useState<string>('');
  const [guardianPhoneOperator, setGuardianPhoneOperator] = useState<string>('');
  const [classLevel, setClassLevel] = useState<number>(8);
  const [medium, setMedium] = useState<'bangla' | 'english_version'>('bangla');
  const [schoolName, setSchoolName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Dhaka');

  // Guardian specific fields
  const [relationType, setRelationType] = useState<
    'father' | 'mother' | 'legal_guardian'
  >('father');
  const [weeklyChannel, setWeeklyChannel] = useState<
    'sms' | 'whatsapp' | 'email' | 'push'
  >('whatsapp');

  // State & errors
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Verification state
  const [otpTargetPhone, setOtpTargetPhone] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpBad, setOtpBad] = useState<boolean>(false);
  const [otpMsg, setOtpMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [resendSeconds, setResendSeconds] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registered user for success screen
  const [registeredUser, setRegisteredUser] = useState<AuthUserDto | null>(null);
  const [progressWidth, setProgressWidth] = useState<string>('0%');

  // Quips
  const [quipIndex, setQuipIndex] = useState<number>(0);
  const [quipOpacity, setQuipOpacity] = useState<number>(1);

  // Cycle quips
  useEffect(() => {
    const timer = setInterval(() => {
      setQuipOpacity(0);
      setTimeout(() => {
        setQuipIndex((prev) => (prev + 1) % QUIPS.length);
        setQuipOpacity(1);
      }, 350);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // OTP Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (pane === 'otp' && resendSeconds > 0) {
      timer = setInterval(() => {
        setResendSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pane, resendSeconds]);

  // Handle phone changes
  const handlePhoneChange = (val: string) => {
    const enDigits = toEn(val).replace(/\D/g, '').slice(0, 11);
    setPhone(enDigits);
    if (enDigits.startsWith('01') && enDigits.length >= 3) {
      setPhoneOperator(OPS[enDigits.slice(1, 3)] || '');
    } else {
      setPhoneOperator('');
    }
  };

  const handleGuardianPhoneChange = (val: string) => {
    const enDigits = toEn(val).replace(/\D/g, '').slice(0, 11);
    setGuardianPhone(enDigits);
    if (enDigits.startsWith('01') && enDigits.length >= 3) {
      setGuardianPhoneOperator(OPS[enDigits.slice(1, 3)] || '');
    } else {
      setGuardianPhoneOperator('');
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Auto transliterate English name if user only gave Bengali name
    const effectiveNameEn =
      nameEn.trim() ||
      (nameBn.trim() ? `User ${phone.slice(-4) || 'PoraHobe'}` : '');

    if (activeTab === 'student') {
      const parsed = studentRegistrationSchema.safeParse({
        name_bn: nameBn,
        name_en: effectiveNameEn,
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
          parsed.error.issues[0]?.message ?? 'শিক্ষার্থী ফর্মের তথ্যগুলো সঠিকভাবে পূরণ করুন।'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await registerStudentApi(parsed.data);
        setSession(response.data.user, response.data.access_token);
        setRegisteredUser(response.data.user);
        setOtpTargetPhone(response.data.user.phone);
        setPane('otp');
        setResendSeconds(30);
        setCanResend(false);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('শিক্ষার্থী নিবন্ধনে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Guardian Registration
    const parsedGuardian = guardianRegistrationSchema.safeParse({
      name_bn: nameBn,
      name_en: effectiveNameEn,
      phone,
      relation_type: relationType,
      weekly_report_channel: weeklyChannel,
      password,
    });

    if (!parsedGuardian.success) {
      setErrorMessage(
        parsedGuardian.error.issues[0]?.message ?? 'অভিভাবক ফর্মের তথ্যগুলো যাচাই করুন।'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerGuardianApi(parsedGuardian.data);
      setSession(response.data.user, response.data.access_token);
      setRegisteredUser(response.data.user);
      setOtpTargetPhone(response.data.user.phone);
      setPane('otp');
      setResendSeconds(30);
      setCanResend(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('অভিভাবক নিবন্ধনে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP handlers
  const handleOtpInput = (index: number, val: string) => {
    const enDigit = toEn(val).replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = enDigit ? toBn(enDigit) : '';
    setOtpDigits(newDigits);
    setOtpBad(false);
    setOtpMsg(null);

    if (enDigit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (enDigit && newDigits.every((d) => d !== '')) {
      triggerVerifyOtp(newDigits.map((d) => toEn(d)).join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = toEn(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      const char = pasted[i];
      newDigits[i] = char ? toBn(char) : '';
    }
    setOtpDigits(newDigits);
    setOtpBad(false);
    setOtpMsg(null);

    const targetIndex = Math.min(pasted.length, 5);
    otpRefs.current[targetIndex]?.focus();

    if (pasted.length === 6) {
      triggerVerifyOtp(pasted);
    }
  };

  const triggerVerifyOtp = async (code: string) => {
    if (code.length < 6) {
      setOtpMsg({ text: `আরও ${toBn(6 - code.length)}টা ডিজিট বাকি।`, isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const clean = toEn(otpTargetPhone).replace(/[\s\-()]/g, '');
      const fullPhone = clean.startsWith('+') ? clean : `+88${clean}`;
      const res = await verifyOtpApi({
        phone: fullPhone,
        code,
        purpose: 'phone_verification',
      });

      if (res.data.user && res.data.access_token) {
        setSession(res.data.user, res.data.access_token);
        setRegisteredUser(res.data.user);
      }
      triggerSuccess();
    } catch (err: unknown) {
      setOtpBad(true);
      setTimeout(() => setOtpBad(false), 500);
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();

      if (err instanceof ApiClientError) {
        setOtpMsg({ text: err.message, isError: true });
      } else {
        setOtpMsg({
          text: 'কোডটা মিলছে না। অনুগ্রহ করে মেসেজ দেখে আবার লিখুন।',
          isError: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendSeconds(30);
    setOtpMsg({ text: 'নতুন কোড পাঠানো হয়েছে।', isError: false });

    try {
      const clean = toEn(otpTargetPhone).replace(/[\s\-()]/g, '');
      const fullPhone = clean.startsWith('+') ? clean : `+88${clean}`;
      const res = await sendOtpApi({ phone: fullPhone, purpose: 'phone_verification' });
      if (res.data.debug_code) {
        setDebugCode(res.data.debug_code);
      }
    } catch {
      // Ignored in test
    }
  };

  const triggerSuccess = () => {
    setPane('done');
    setTimeout(() => {
      setProgressWidth('100%');
    }, 150);

    setTimeout(() => {
      if (activeTab === 'guardian') {
        router.push('/parent/dashboard');
      } else {
        router.push('/home');
      }
    }, 2400);
  };

  const handleProceed = () => {
    if (activeTab === 'guardian') {
      router.push('/parent/dashboard');
    } else {
      router.push('/home');
    }
  };

  const todayBanglaDay = BANGLA_DAYS[new Date().getDay()];

  return (
    <>
      <div className="auth-tex" aria-hidden="true" />

      <div className="auth-shell">
        {/* ==================== LEFT: THE BOARD ==================== */}
        <aside className="auth-board" aria-label="পড়া হবে!">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-mark" aria-hidden="true">
              প
            </span>
            <span className="auth-logo-word">
              পড়া হবে<em>!</em>
            </span>
          </Link>

          <div className="auth-board-main">
            <h2 className="auth-hello">
              নতুন যাত্রা <span className="mk">শুরু!</span>
            </h2>

            <p className="auth-hand-line">
              <svg viewBox="0 0 46 24" aria-hidden="true">
                <path
                  d="M3 18c10-1 22-6 36-14M39 4l-9 0M39 4l-2 9"
                  fill="none"
                  stroke="#FFB238"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
              প্যাঁচ যতই থাকুক, পড়া হবে!
            </p>

            <p className="auth-sub">
              তোমার ব্যক্তিগত AI Home Tutor। বুঝে শেখো, যেকোনো প্রশ্ন করো আর প্রতিদিন নিজের গতিতে সেরাটা অর্জন করো।
            </p>

            {/* Scrap Notebook Card */}
            <div className="auth-scrap-wrap">
              <div className="auth-scrap">
                <h2>আজই শুরু করো · {todayBanglaDay}</h2>
                <ul>
                  <li className="ok">
                    <span className="box">
                      <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
                        <path
                          d="M1 4l3 3 5-6"
                          fill="none"
                          stroke="#1D7A45"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <s>ব্যক্তিগত AI টিউটর ২৪/৭ সাথে</s>
                  </li>
                  <li className="ok">
                    <span className="box">
                      <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
                        <path
                          d="M1 4l3 3 5-6"
                          fill="none"
                          stroke="#1D7A45"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <s>NCTB ষষ্ঠ–দশম শ্রেণির ফুল সিলেবাস</s>
                  </li>
                  <li>
                    <span className="box" />
                    ধাপে ধাপে সমাধান ও স্পষ্ট ব্যাখ্যা
                  </li>
                  <li>
                    <span className="box" />
                    বাবা-মায়ের জন্য রিয়েল-টাইম রিপোর্ট
                  </li>
                </ul>
                <span className="eg">কোনো ক্রেডিট কার্ড ছাড়াই আজীবন ফ্রি বেসিক অ্যাক্সেস</span>
              </div>

              {/* Sticker */}
              <div className="auth-sticker" aria-hidden="true">
                <svg viewBox="0 0 40 40">
                  <path
                    d="M20 20c0-2 2-3 3.5-2s1.5 4-1 5.5-6 .5-7-3 1.5-7.5 5.5-8 9 2 9.5 7-3 10-8.5 10.5S10 27 9.5 21 13 9.5 19.5 9"
                    fill="none"
                    stroke="#241600"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
                <b>প্যাঁচ যতই থাকুক, পড়া হবে!</b>
              </div>
            </div>
          </div>

          {/* AI Tutor Quip bubble */}
          <div className="auth-quip" aria-live="off">
            <span className="ava" aria-hidden="true">
              প
            </span>
            <div
              className="bub"
              style={{ opacity: quipOpacity, transition: 'opacity 0.35s ease' }}
            >
              {QUIPS[quipIndex]}
            </div>
          </div>

          <div className="auth-board-foot">
            <Link href="/#help">সাহায্য দরকার?</Link>
            <Link href="/#privacy">গোপনীয়তা নীতি</Link>
            <span>© ২০২৬ পড়া হবে!</span>
          </div>
        </aside>

        {/* ==================== RIGHT: THE DESK ==================== */}
        <main className="auth-desk">
          <div className="auth-form-wrap" style={{ maxWidth: '480px' }}>
            {/* ---------------- STEP 1: REGISTRATION FORM ---------------- */}
            {pane === 'form' && (
              <div className="auth-pane">
                <div style={{ display: 'grid', gap: '18px' }}>
                  <div className="auth-f-head">
                    <h1>অ্যাকাউন্ট খোলো</h1>
                    <p>
                      আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/login">লগইন করো →</Link>
                    </p>
                  </div>

                  {/* Role Selector: Student vs Guardian */}
                  <div className="auth-seg" role="tablist" aria-label="অ্যাকাউন্টের ধরন">
                    <button
                      type="button"
                      role="tab"
                      id="tabStudent"
                      aria-selected={activeTab === 'student'}
                      onClick={() => {
                        setActiveTab('student');
                        setErrorMessage(null);
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M4 6.5C6.5 5 9.5 5 12 7c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path d="M12 7v12.5" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      শিক্ষার্থী
                    </button>

                    <button
                      type="button"
                      role="tab"
                      id="tabGuardian"
                      aria-selected={activeTab === 'guardian'}
                      onClick={() => {
                        setActiveTab('guardian');
                        setErrorMessage(null);
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="17" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        <path
                          d="M3.5 19c.5-3.5 3-5.5 5.5-5.5s5 2 5.5 5.5M14 19c.3-2.4 1.5-4 3-4s2.8 1.6 3.2 4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      অভিভাবক
                    </button>
                  </div>

                  <p className="auth-role-note">
                    {activeTab === 'student'
                      ? 'তোমার সিলেবাস অনুযায়ী ধাপে ধাপে ব্যক্তিগত টিউটরিং শুরু হবে।'
                      : 'সন্তানের পড়ার অগ্রগতি, পরীক্ষার ফল ও সাপ্তাহিক রিপোর্ট দেখতে পারবেন।'}
                  </p>

                  {errorMessage && (
                    <div className="auth-msg e" role="alert">
                      <span>⚠️</span> {errorMessage}
                    </div>
                  )}

                  <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="auth-field">
                        <label htmlFor="nameBn">পূর্ণ নাম (বাংলায়)</label>
                        <div className="auth-inp">
                          <input
                            id="nameBn"
                            type="text"
                            placeholder="যেমন: তানভীর আহমেদ"
                            value={nameBn}
                            onChange={(e) => setNameBn(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-field">
                        <label htmlFor="nameEn">Name (English)</label>
                        <div className="auth-inp">
                          <input
                            id="nameEn"
                            type="text"
                            placeholder="e.g. Tanvir Ahmed"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Student Fields */}
                    {activeTab === 'student' ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="auth-field">
                            <label htmlFor="studentPhone">শিক্ষার্থীর ফোন</label>
                            <div className="auth-inp">
                              <span className="auth-prefix">
                                <span className="auth-flag" aria-hidden="true" />
                                +৮৮
                              </span>
                              <input
                                id="studentPhone"
                                type="tel"
                                inputMode="numeric"
                                placeholder="017XXXXXXXX"
                                maxLength={11}
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                required
                              />
                              {phoneOperator && <span className="auth-op">{phoneOperator}</span>}
                            </div>
                          </div>

                          <div className="auth-field">
                            <label htmlFor="guardianPhone">অভিভাবকের ফোন (PDPA)</label>
                            <div className="auth-inp">
                              <span className="auth-prefix">
                                <span className="auth-flag" aria-hidden="true" />
                                +৮৮
                              </span>
                              <input
                                id="guardianPhone"
                                type="tel"
                                inputMode="numeric"
                                placeholder="018XXXXXXXX"
                                maxLength={11}
                                value={guardianPhone}
                                onChange={(e) => handleGuardianPhoneChange(e.target.value)}
                                required
                              />
                              {guardianPhoneOperator && (
                                <span className="auth-op">{guardianPhoneOperator}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Class selection pills */}
                        <div className="auth-field">
                          <label>বর্তমান শ্রেণি (NCTB)</label>
                          <div className="grid grid-cols-5 gap-2">
                            {[6, 7, 8, 9, 10].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setClassLevel(lvl)}
                                className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                                  classLevel === lvl
                                    ? 'border-[var(--marigold)] bg-[var(--marigold)] text-[var(--marigold-ink)] shadow-sm'
                                    : 'border-[var(--rule-2)] bg-[var(--slate)] text-[var(--chalk-2)] hover:border-[var(--chalk-3)]'
                                }`}
                              >
                                {toBn(lvl)}ষ্ঠ
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Medium Selection */}
                        <div className="auth-field">
                          <label htmlFor="mediumSelect">শিক্ষার মাধ্যম</label>
                          <div className="auth-inp">
                            <select
                              id="mediumSelect"
                              value={medium}
                              onChange={(e) =>
                                setMedium(e.target.value as 'bangla' | 'english_version')
                              }
                            >
                              <option value="bangla">বাংলা মাধ্যম (Bangla Medium)</option>
                              <option value="english_version">
                                ইংলিশ ভার্সন (English Version)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* School and District */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="auth-field">
                            <label htmlFor="schoolName">বিদ্যালয়ের নাম (ঐচ্ছিক)</label>
                            <div className="auth-inp">
                              <input
                                id="schoolName"
                                type="text"
                                placeholder="যেমন: মতিঝিল আইডিয়াল স্কুল"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="auth-field">
                            <label htmlFor="districtSelect">জেলা (ঐচ্ছিক)</label>
                            <div className="auth-inp">
                              <select
                                id="districtSelect"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                              >
                                <option value="Dhaka">ঢাকা (Dhaka)</option>
                                <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                                <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                                <option value="Khulna">খুলনা (Khulna)</option>
                                <option value="Barisal">বরিশাল (Barisal)</option>
                                <option value="Sylhet">সিলেট (Sylhet)</option>
                                <option value="Rangpur">রংপুর (Rangpur)</option>
                                <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Guardian Fields */
                      <>
                        <div className="auth-field">
                          <label htmlFor="guardianMyPhone">অভিভাবকের মোবাইল নম্বর</label>
                          <div className="auth-inp">
                            <span className="auth-prefix">
                              <span className="auth-flag" aria-hidden="true" />
                              +৮৮
                            </span>
                            <input
                              id="guardianMyPhone"
                              type="tel"
                              inputMode="numeric"
                              placeholder="019XXXXXXXX"
                              maxLength={11}
                              value={phone}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                              required
                            />
                            {phoneOperator && <span className="auth-op">{phoneOperator}</span>}
                          </div>
                          <p className="auth-msg h">
                            এই নম্বরে শিক্ষার্থীর সাপ্তাহিক পরীক্ষার ফলাফল ও নোটিফিকেশন যাবে।
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="auth-field">
                            <label htmlFor="relationType">শিক্ষার্থীর সাথে সম্পর্ক</label>
                            <div className="auth-inp">
                              <select
                                id="relationType"
                                value={relationType}
                                onChange={(e) =>
                                  setRelationType(
                                    e.target.value as 'father' | 'mother' | 'legal_guardian'
                                  )
                                }
                              >
                                <option value="father">পিতা (Father)</option>
                                <option value="mother">মাতা (Mother)</option>
                                <option value="legal_guardian">আইনগত অভিভাবক (Guardian)</option>
                              </select>
                            </div>
                          </div>

                          <div className="auth-field">
                            <label htmlFor="channelSelect">সাপ্তাহিক রিপোর্ট মাধ্যম</label>
                            <div className="auth-inp">
                              <select
                                id="channelSelect"
                                value={weeklyChannel}
                                onChange={(e) =>
                                  setWeeklyChannel(
                                    e.target.value as 'sms' | 'whatsapp' | 'email' | 'push'
                                  )
                                }
                              >
                                <option value="whatsapp">হোয়াটসঅ্যাপ (WhatsApp)</option>
                                <option value="sms">এসএমএস (SMS)</option>
                                <option value="email">ইমেইল (Email)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Password Field */}
                    <div className="auth-field">
                      <label htmlFor="regPass">পাসওয়ার্ড নির্ধারণ করো</label>
                      <div className="auth-inp">
                        <input
                          id="regPass"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          className="auth-eye"
                          type="button"
                          aria-label={showPassword ? 'পাসওয়ার্ড লুকাও' : 'পাসওয়ার্ড দেখাও'}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                            {showPassword && (
                              <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="auth-spin" aria-hidden="true" />
                          অ্যাকাউন্ট তৈরি হচ্ছে…
                        </>
                      ) : (
                        <>
                          অ্যাকাউন্ট তৈরি করো <span className="arr" aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="auth-legal">
                    নিবন্ধন সম্পন্ন করার মাধ্যমে তুমি আমাদের{' '}
                    <Link href="/#terms">শর্তাবলি</Link> ও{' '}
                    <Link href="/#privacy">গোপনীয়তা নীতি (PDPA ২০২৬)</Link> মেনে নিচ্ছো।
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: OTP VERIFICATION PANE ---------------- */}
            {pane === 'otp' && (
              <div className="auth-pane">
                <div style={{ display: 'grid', gap: '22px' }}>
                  <button
                    className="auth-back"
                    type="button"
                    onClick={() => setPane('form')}
                  >
                    ← তথ্য বদলাও
                  </button>

                  <div className="auth-f-head">
                    <h1>নম্বর যাচাই করো</h1>
                    <p>
                      ৬ ডিজিটের কোড পাঠানো হয়েছে{' '}
                      <span className="auth-sent-to">{otpTargetPhone}</span> নম্বরে।
                    </p>
                  </div>

                  <form
                    className="auth-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      triggerVerifyOtp(otpDigits.map((d) => toEn(d)).join(''));
                    }}
                    noValidate
                  >
                    <div
                      className={`auth-otp ${otpBad ? 'bad shake' : ''}`}
                      role="group"
                      aria-label="৬ ডিজিটের কোড"
                    >
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          className={digit ? 'filled' : ''}
                          aria-label={`ডিজিট ${toBn(i + 1)}`}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={handleOtpPaste}
                        />
                      ))}
                    </div>

                    {otpMsg && (
                      <p className={`auth-msg ${otpMsg.isError ? 'e' : 's'}`}>
                        {otpMsg.text}
                      </p>
                    )}

                    <div className="auth-resend">
                      <span>
                        {resendSeconds > 0
                          ? `আবার পাঠানো যাবে ০:${toBn(String(resendSeconds).padStart(2, '0'))} পরে`
                          : 'কোড আসেনি?'}
                      </span>
                      <button
                        type="button"
                        disabled={!canResend}
                        onClick={handleResendOtp}
                      >
                        আবার পাঠাও
                      </button>
                    </div>

                    <button className="auth-btn" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="auth-spin" aria-hidden="true" />
                          যাচাই করছি…
                        </>
                      ) : (
                        <>
                          যাচাই করে সম্পন্ন করো <span className="arr" aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                  </form>

                  {debugCode && (
                    <p className="auth-demo-hint">
                      সহায়তা (টেস্ট কোড): <b>{toBn(debugCode || '')}</b> বা যেকোনো ৬ ডিজিট দাও।
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: DONE SUCCESS PANE ---------------- */}
            {pane === 'done' && (
              <div className="auth-pane">
                <div className="auth-done">
                  <p className="big">
                    স্বাগতম,{' '}
                    <em>{registeredUser?.name_bn || nameBn || 'শিক্ষার্থী'}!</em>
                  </p>

                  <p style={{ margin: 0, color: 'var(--chalk-2)' }}>
                    তোমার অ্যাকাউন্ট সফলভাবে প্রস্তুত হয়েছে। চলো তোমার পড়া শুরু করি!
                  </p>

                  <div className="auth-resume">
                    <small>প্রস্তুতি সম্পন্ন</small>
                    <b>
                      {activeTab === 'guardian'
                        ? 'অভিভাবক পর্যবেক্ষণ ড্যাশবোর্ড'
                        : `শ্রেণি: ${toBn(classLevel)}ষ্ঠ · ${medium === 'bangla' ? 'বাংলা মাধ্যম' : 'English Version'}`}
                    </b>
                    <div className="auth-bar">
                      <i style={{ width: progressWidth }} />
                    </div>
                    <small>সব বিষয় ও AI টিউটর আনলক করা হয়েছে</small>
                  </div>

                  <button className="auth-btn" type="button" onClick={handleProceed}>
                    চলো, পড়া শুরু করি! <span className="arr" aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
