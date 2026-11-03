'use client';

import React, { useState, useEffect, useRef } from 'react';
import '@/styles/auth.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginApi, sendOtpApi, verifyOtpApi } from '@/features/auth/api/auth.api';
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
  'গতকাল সরল সমীকরণে ছিলে। আজ এক ধাপ সামনে?',
  'পাসওয়ার্ড ভুলে গেলে সমস্যা নাই, অঙ্ক তো মনে আছে!',
  'আজকের লক্ষ্য মাত্র ৪৫ মিনিট। চা নিয়ে বসে পড়ো।',
  'প্যাঁচ যতই থাকুক, পড়া হবে!',
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

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  // Panes: 'login' | 'otp' | 'done'
  const [pane, setPane] = useState<'login' | 'otp' | 'done'>('login');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  // Phone tab state
  const [phone, setPhone] = useState<string>('01712345678');
  const [operator, setOperator] = useState<string>('গ্রামীণফোন');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Email/Password tab state
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // General loading/error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // OTP pane state
  const [sentToPhone, setSentToPhone] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpBad, setOtpBad] = useState<boolean>(false);
  const [otpMsg, setOtpMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [resendSeconds, setResendSeconds] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  // Logged-in user data for success screen
  const [loggedInUser, setLoggedInUser] = useState<AuthUserDto | null>(null);
  const [progressWidth, setProgressWidth] = useState<string>('0%');

  // Quips state
  const [quipIndex, setQuipIndex] = useState<number>(0);
  const [quipOpacity, setQuipOpacity] = useState<number>(1);

  // OTP input refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Rotate quips
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

  // OTP resend timer
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

  // Handle phone input changes
  const handlePhoneInput = (val: string) => {
    const enDigits = toEn(val).replace(/\D/g, '').slice(0, 11);
    setPhone(enDigits);
    setPhoneError(null);

    if (enDigits.startsWith('01') && enDigits.length >= 3) {
      const prefix = enDigits.slice(1, 3);
      setOperator(OPS[prefix] || '');
    } else {
      setOperator('');
    }
  };

  // Submit phone -> send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setGeneralError(null);

    const clean = toEn(phone).replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(clean)) {
      if (clean.length !== 11) {
        setPhoneError(`নম্বরটা ১১ ডিজিটের হবে। এখন আছে ${toBn(clean.length)}টা।`);
      } else {
        setPhoneError('নম্বরটা ০১৩ থেকে ০১৯ দিয়ে শুরু হবে।');
      }
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+88${clean}`;
      const res = await sendOtpApi({ phone: fullPhone, purpose: 'login' });
      setSentToPhone(`+৮৮ ${toBn(clean.slice(0, 5))}-${toBn(clean.slice(5))}`);
      setDebugCode(res.data.debug_code || null);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpBad(false);
      setOtpMsg(null);
      setResendSeconds(30);
      setCanResend(false);
      setPane('otp');

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setPhoneError(err.message);
      } else {
        // Fallback for offline demo mode
        setSentToPhone(`+৮৮ ${toBn(clean.slice(0, 5))}-${toBn(clean.slice(5))}`);
        setDebugCode('123456');
        setPane('otp');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendSeconds(30);
    setOtpMsg({ text: 'নতুন কোড পাঠানো হয়েছে।', isError: false });

    try {
      const clean = toEn(phone).replace(/\D/g, '');
      const fullPhone = `+88${clean}`;
      const res = await sendOtpApi({ phone: fullPhone, purpose: 'login' });
      if (res.data.debug_code) {
        setDebugCode(res.data.debug_code);
      }
    } catch {
      // Ignored in demo
    }
  };

  // Handle OTP digit change
  const handleOtpInput = (index: number, val: string) => {
    const enDigit = toEn(val).replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = enDigit ? toBn(enDigit) : '';
    setOtpDigits(newDigits);
    setOtpBad(false);
    setOtpMsg(null);

    // Auto advance
    if (enDigit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    if (enDigit && newDigits.every((d) => d !== '')) {
      triggerVerifyOtp(newDigits.map((d) => toEn(d)).join(''));
    }
  };

  // Handle OTP backspace and arrow navigation
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

  // Handle OTP paste
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

  // Verify OTP submission
  const triggerVerifyOtp = async (code: string) => {
    if (code.length < 6) {
      setOtpMsg({ text: `আরও ${toBn(6 - code.length)}টা ডিজিট বাকি।`, isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const clean = toEn(phone).replace(/\D/g, '');
      const fullPhone = `+88${clean}`;
      const res = await verifyOtpApi({ phone: fullPhone, code, purpose: 'login' });

      if (res.data.user && res.data.access_token) {
        setSession(res.data.user, res.data.access_token);
        setLoggedInUser(res.data.user);
        triggerSuccess(res.data.user);
      } else {
        // Mock fallback if backend user wasn't registered
        triggerSuccess({
          uuid: 'mock-uuid',
          name_en: 'Nadia Sultana',
          name_bn: 'নাদিয়া সুলতানা',
          phone: fullPhone,
          email: null,
          account_type: role === 'parent' ? 'guardian' : 'student',
          status: 'active',
          phone_verified: true,
        });
      }
    } catch (err: unknown) {
      setOtpBad(true);
      setTimeout(() => setOtpBad(false), 500);
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();

      if (err instanceof ApiClientError) {
        setOtpMsg({ text: err.message, isError: true });
      } else {
        setOtpMsg({
          text: 'কোডটা মিলছে না। ভুল হইছে? সমস্যা নাই, আবার হবে! মেসেজটা আরেকবার দেখে নাও।',
          isError: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPassError(null);
    setGeneralError(null);

    const idVal = identifier.trim();
    if (!idVal) {
      setEmailError('মোবাইল নম্বর অথবা ইমেইল লিখে দাও।');
      return;
    }

    if (password.length < 6) {
      setPassError(
        password
          ? `পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের। এখন ${toBn(password.length)}টা।`
          : 'পাসওয়ার্ড লিখে দাও।'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Normalize if phone
      const cleanPhone = toEn(idVal).replace(/[\s\-()]+/g, '');
      const finalId = cleanPhone.startsWith('01')
        ? `+88${cleanPhone}`
        : cleanPhone.startsWith('8801')
        ? `+${cleanPhone}`
        : idVal;

      const response = await loginApi({ phone: finalId, password });
      setSession(response.data.user, response.data.access_token);
      setLoggedInUser(response.data.user);
      triggerSuccess(response.data.user);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setGeneralError(err.message);
      } else {
        setGeneralError('লগইন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success transition
  const triggerSuccess = (user: AuthUserDto) => {
    setPane('done');
    setTimeout(() => {
      setProgressWidth(user.account_type === 'guardian' ? '83%' : '73%');
    }, 100);

    // Auto navigate after 2 seconds
    setTimeout(() => {
      if (user.account_type === 'guardian') {
        router.push('/parent/dashboard');
      } else {
        router.push('/home');
      }
    }, 2200);
  };

  const handleProceedNow = () => {
    if (loggedInUser?.account_type === 'guardian' || role === 'parent') {
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
              আবার দেখা <span className="mk">হলো!</span>
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
              আজকে পড়া হবে, বুঝেও হবে!
            </p>

            <p className="auth-sub">
              লগইন করলেই তোমার Tutor মনে রাখবে কোথায় থেমেছিলে, কোন অঙ্কে আটকেছিলে আর আজ কী পড়ার কথা।
            </p>

            {/* Khata Scrap Checklist */}
            <div className="auth-scrap-wrap">
              <div className="auth-scrap">
                <h2>আজকের পড়া · {todayBanglaDay}</h2>
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
                    <s>সরল সমীকরণ · অনুশীলনী ৫.১</s>
                  </li>
                  <li>
                    <span className="box" />
                    আলোর প্রতিফলন · ২০ মিনিট
                  </li>
                  <li>
                    <span className="box" />
                    Tense প্র্যাকটিস · ১০টা
                  </li>
                </ul>
                <span className="eg">উদাহরণ: লগইনের পর এখানে তোমার নিজের লিস্ট থাকবে</span>
              </div>

              {/* Tilted Sticker */}
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
          <div className="auth-form-wrap">
            {/* ---------------- STEP 1: LOGIN PANE ---------------- */}
            {pane === 'login' && (
              <div className="auth-pane">
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="auth-f-head">
                    <h1>লগইন করো</h1>
                    <p>
                      নতুন এখানে? <Link href="/register">অ্যাকাউন্ট খোলো →</Link>
                    </p>
                  </div>

                  {/* Role Switch: Student vs Parent */}
                  <div className="auth-seg" role="tablist" aria-label="কে লগইন করছে">
                    <button
                      type="button"
                      role="tab"
                      id="roleStudent"
                      aria-selected={role === 'student'}
                      onClick={() => setRole('student')}
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
                      id="roleParent"
                      aria-selected={role === 'parent'}
                      onClick={() => setRole('parent')}
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
                    {role === 'student'
                      ? 'তোমার লেসন, অগ্রগতি আর পরীক্ষা সব এক জায়গায়।'
                      : 'সন্তানের সাপ্তাহিক রিপোর্ট, পড়ার সময় আর পরীক্ষার ফল দেখুন।'}
                  </p>

                  {/* Method Switch: Phone OTP vs Password */}
                  <div className="auth-tabs" role="tablist" aria-label="লগইনের উপায়">
                    <button
                      type="button"
                      role="tab"
                      id="tabPhone"
                      aria-selected={activeTab === 'phone'}
                      onClick={() => setActiveTab('phone')}
                    >
                      মোবাইল নম্বর
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tabEmail"
                      aria-selected={activeTab === 'email'}
                      onClick={() => setActiveTab('email')}
                    >
                      পাসওয়ার্ড দিয়ে
                    </button>
                  </div>

                  {generalError && (
                    <div className="auth-msg e" role="alert">
                      <span>⚠️</span> {generalError}
                    </div>
                  )}

                  {/* Tab 1: Phone OTP Form */}
                  {activeTab === 'phone' && (
                    <form className="auth-form" onSubmit={handleSendOtp} noValidate>
                      <div className="auth-field">
                        <label htmlFor="phone">মোবাইল নম্বর</label>
                        <div className={`auth-inp ${phoneError ? 'err' : ''}`}>
                          <span className="auth-prefix">
                            <span className="auth-flag" aria-hidden="true" />
                            +৮৮
                          </span>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="01XXXXXXXXX"
                            maxLength={11}
                            value={phone}
                            onChange={(e) => handlePhoneInput(e.target.value)}
                          />
                          {operator && <span className="auth-op">{operator}</span>}
                        </div>
                        {phoneError ? (
                          <p className="auth-msg e">{phoneError}</p>
                        ) : (
                          <p className="auth-msg h">
                            {role === 'student'
                              ? 'এই নম্বরে ৬ ডিজিটের একটা কোড যাবে।'
                              : 'যে নম্বর দিয়ে সন্তানের অ্যাকাউন্টে যুক্ত হয়েছেন।'}
                          </p>
                        )}
                      </div>

                      <button className="auth-btn" type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="auth-spin" aria-hidden="true" />
                            কোড পাঠাচ্ছি…
                          </>
                        ) : (
                          <>
                            কোড পাঠাও <span className="arr" aria-hidden="true">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Tab 2: Password Login Form */}
                  {activeTab === 'email' && (
                    <form className="auth-form" onSubmit={handlePasswordLogin} noValidate>
                      <div className="auth-field">
                        <label htmlFor="email">মোবাইল নম্বর অথবা ইমেইল</label>
                        <div className={`auth-inp ${emailError ? 'err' : ''}`}>
                          <input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="username"
                            placeholder="017XXXXXXXX বা tumi@example.com"
                            value={identifier}
                            onChange={(e) => {
                              setIdentifier(e.target.value);
                              setEmailError(null);
                            }}
                          />
                        </div>
                        {emailError && <p className="auth-msg e">{emailError}</p>}
                      </div>

                      <div className="auth-field">
                        <label htmlFor="pass">
                          <span>পাসওয়ার্ড</span>
                          <a href="#forgot" onClick={(e) => e.preventDefault()}>
                            ভুলে গেছো?
                          </a>
                        </label>
                        <div className={`auth-inp ${passError ? 'err' : ''}`}>
                          <input
                            id="pass"
                            name="pass"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="কমপক্ষে ৬ অক্ষর"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setPassError(null);
                            }}
                          />
                          <button
                            className="auth-eye"
                            type="button"
                            aria-label={showPassword ? 'পাসওয়ার্ড লুকাও' : 'পাসওয়ার্ড দেখাও'}
                            aria-pressed={showPassword}
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
                        {passError && <p className="auth-msg e">{passError}</p>}
                      </div>

                      <label className="auth-check" htmlFor="remember">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberDevice}
                          onChange={(e) => setRememberDevice(e.target.checked)}
                        />
                        এই ডিভাইসে মনে রাখো
                      </label>

                      <button className="auth-btn" type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="auth-spin" aria-hidden="true" />
                            লগইন হচ্ছে…
                          </>
                        ) : (
                          <>
                            লগইন করো <span className="arr" aria-hidden="true">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="auth-or">অথবা</div>

                  <button
                    className="auth-alt"
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        triggerSuccess({
                          uuid: 'google-user',
                          name_en: 'Tanvir Ahmed',
                          name_bn: 'তানভীর আহমেদ',
                          phone: '+8801712345678',
                          email: 'tanvir@gmail.com',
                          account_type: role === 'parent' ? 'guardian' : 'student',
                          status: 'active',
                          phone_verified: true,
                        });
                      }, 700);
                    }}
                  >
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                      />
                    </svg>
                    Google দিয়ে চালিয়ে যাও
                  </button>

                  <p className="auth-legal">
                    চালিয়ে গেলে তুমি আমাদের <Link href="/#terms">শর্তাবলি</Link> ও{' '}
                    <Link href="/#privacy">গোপনীয়তা নীতি</Link> মেনে নিচ্ছো।
                  </p>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: OTP PANE ---------------- */}
            {pane === 'otp' && (
              <div className="auth-pane">
                <div style={{ display: 'grid', gap: '22px' }}>
                  <button
                    className="auth-back"
                    type="button"
                    onClick={() => setPane('login')}
                  >
                    ← নম্বর বদলাও
                  </button>

                  <div className="auth-f-head">
                    <h1>কোডটা দাও</h1>
                    <p>
                      ৬ ডিজিটের কোড পাঠানো হয়েছে{' '}
                      <span className="auth-sent-to">{sentToPhone}</span> নম্বরে।
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

                    <button className="auth-btn" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="auth-spin" aria-hidden="true" />
                          যাচাই করছি…
                        </>
                      ) : (
                        <>
                          যাচাই করো <span className="arr" aria-hidden="true">→</span>
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

            {/* ---------------- STEP 3: SUCCESS PANE ---------------- */}
            {pane === 'done' && (
              <div className="auth-pane">
                <div className="auth-done">
                  <p className="big">
                    {role === 'parent' || loggedInUser?.account_type === 'guardian' ? (
                      <>
                        স্বাগতম, <em>অভিভাবক!</em>
                      </>
                    ) : (
                      <>
                        স্বাগতম, <em>{loggedInUser?.name_bn || 'নাদিয়া'}!</em>
                      </>
                    )}
                  </p>

                  <p style={{ margin: 0, color: 'var(--chalk-2)' }}>
                    {role === 'parent' || loggedInUser?.account_type === 'guardian'
                      ? 'সন্তানের এই সপ্তাহের পড়া ও অগ্রগতির রিপোর্ট প্রস্তুত আছে।'
                      : 'যেখানে থেমেছিলে, সেখান থেকেই শুরু করছি।'}
                  </p>

                  <div className="auth-resume">
                    <small>
                      {role === 'parent' || loggedInUser?.account_type === 'guardian'
                        ? 'এই সপ্তাহ · সংক্ষিপ্ত রিপোর্ট'
                        : 'চলমান লেসন'}
                    </small>
                    <b>
                      {role === 'parent' || loggedInUser?.account_type === 'guardian'
                        ? '৬ ঘণ্টা ৪০ মিনিট পড়েছে · টানা ১২ দিন'
                        : 'গণিত · অধ্যায় ৫: সরল সমীকরণ'}
                    </b>
                    <div className="auth-bar">
                      <i style={{ width: progressWidth }} />
                    </div>
                    <small>
                      {role === 'parent' || loggedInUser?.account_type === 'guardian'
                        ? 'সাপ্তাহিক লক্ষ্যের ৮৩% পূরণ'
                        : '১১টির মধ্যে ৮টি লেসন শেষ'}
                    </small>
                  </div>

                  <button className="auth-btn" type="button" onClick={handleProceedNow}>
                    {role === 'parent' || loggedInUser?.account_type === 'guardian' ? (
                      <>
                        রিপোর্ট দেখুন <span className="arr" aria-hidden="true">→</span>
                      </>
                    ) : (
                      <>
                        চলো, পড়া শুরু করি! <span className="arr" aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <button
                    className="auth-back"
                    type="button"
                    onClick={() => {
                      setPane('login');
                      setProgressWidth('0%');
                    }}
                  >
                    ← লগইন স্ক্রিনে ফিরে যাও (ডেমো)
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
