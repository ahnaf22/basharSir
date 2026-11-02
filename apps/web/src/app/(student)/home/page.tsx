'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { fetchStudentDashboardApi, type StudentDashboardDto } from '@/features/dashboard/api/student-dashboard.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { logoutApi } from '@/features/auth/api/auth.api';
import {
  getTimeOfDayGreeting,
  formatGregorianBanglaDate,
  formatBongabdoDate,
} from '@/lib/bangla-date';

/* --------------------------------------------------------------------------
   Stage mapping: Maps backend TutoringEngine states to 5 student-friendly steps
   -------------------------------------------------------------------------- */
const STAGES = [
  'শুরুর আগে: আগের পড়া ঝালাই',
  'ধারণা',
  'উদাহরণ',
  'নিজে করো',
  'ছোট কুইজ',
];

function getStageIndex(stage?: string): number {
  switch (stage) {
    case 'START_LESSON':
    case 'CHECK_PREREQUISITES':
      return 0;
    case 'TEACH_PREREQUISITE':
    case 'EXPLAIN_CONCEPT':
      return 1;
    case 'WORKED_EXAMPLE':
      return 2;
    case 'ASK_STUDENT_QUESTION':
    case 'IDENTIFY_MISCONCEPTION':
    case 'INCREASE_DIFFICULTY':
      return 3;
    case 'MINI_ASSESSMENT':
    case 'SAVE_PROGRESS':
      return 4;
    default:
      return 0;
  }
}

/* --------------------------------------------------------------------------
   Demo answers for interactive AI Tutor question box
   -------------------------------------------------------------------------- */
const ASK_ANSWERS: Array<[RegExp, string]> = [
  [
    /সহগ|চলক/,
    'ধরো 5x। এখানে x হলো চলক, মানে যার মান বদলাতে পারে। আর 5 হলো সহগ, x-এর সাথে গুণ হয়ে আছে। 5x মানে পাঁচটা x। বুঝলে, নাকি আরেকটা উদাহরণ দেবো?',
  ],
  [
    /সূত্র|বীজগণিত/,
    'বীজগণিতের মূল সৌন্দর্য হলো সূত্র দিয়ে বড় হিসাব এক নিমেষে সহজ করা। যেমন: (a + b)² = a² + 2ab + b²। এটি জ্যামিতিক বর্গের ক্ষেত্রফল থেকেও সহজে প্রমাণ করা যায়!',
  ],
  [
    /.*/,
    'ভালো প্রশ্ন! চলো লেসনের ধারণা ধাপে গিয়ে এটা একসাথে দেখি। আমি একটা সহজ বাস্তব উদাহরণ দিয়ে শুরু করছি।',
  ],
];

export default function StudentHomePage(): React.ReactElement {
  const router = useRouter();
  const { user, entitlements, clearSession } = useAuthStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dashboard query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await fetchStudentDashboardApi();
      return res.data;
    },
    staleTime: 30_000,
  });

  // UI States
  const [showNotes, setShowNotes] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set());
  const [askQuery, setAskQuery] = useState('সহগ আর চলকের পার্থক্য কী?');
  const [replyText, setReplyText] = useState<string | null>(null);
  const [uploadedFilesCount, setUploadedFilesCount] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize completed tasks from API
  useEffect(() => {
    if (data?.today_tasks) {
      const initialCompleted = new Set<number>();
      data.today_tasks.forEach((t) => {
        if (t.status === 'completed') {
          initialCompleted.add(t.id);
        }
      });
      setCompletedTaskIds(initialCompleted);
    }
  }, [data?.today_tasks]);

  // "/" keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    clearSession();
    router.replace('/login');
  };

  // Toggle routine task
  const handleToggleTask = (taskId: number) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Ask Tutor form submit
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = askQuery.trim();
    if (!q) {
      searchInputRef.current?.focus();
      return;
    }
    const matched = ASK_ANSWERS.find(([regex]) => regex.test(q));
    setReplyText(matched ? matched[1] : (ASK_ANSWERS[2]?.[1] ?? 'ভালো প্রশ্ন!'));
  };

  // File Upload Handling
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadedFilesCount(files.length);
  };

  // Date and Time computations
  const now = new Date();
  const greeting = getTimeOfDayGreeting(now);
  const gregorianDateBn = formatGregorianBanglaDate(now);
  const bongabdoDateBn = formatBongabdoDate(now);

  const studentName = data?.student?.name_bn || data?.student?.name_en || user?.name_bn || 'শিক্ষার্থী';
  const firstName = studentName.split(' ')[0] || studentName;
  const studentInitial = firstName.charAt(0) || 'শি';
  const classLevel = data?.student?.current_class_level || 8;
  const mediumBn = (data?.student?.medium || 'bangla') === 'bangla' ? 'বাংলা মিডিয়াম' : 'ইংরেজি ভার্সন';

  // Dynamic Study Time and Ring calculation
  const baseActiveMins = data?.today_study_time?.active_minutes ?? 30;
  const targetMins = data?.today_study_time?.target_minutes ?? 45;
  // Each task toggled on adds 8 dynamic minutes to desk progress
  const dynamicBonusMins = completedTaskIds.size * 8;
  const currentActiveMins = Math.min(baseActiveMins + dynamicBonusMins, targetMins + 30);
  const remainingMins = Math.max(0, targetMins - currentActiveMins);

  // SVG Goal Ring: radius 20, circumference 125.7
  const ringCircumference = 125.7;
  const ringProgressFraction = Math.min(1, currentActiveMins / targetMins);
  const ringDashOffset = ringCircumference * (1 - ringProgressFraction);

  // Tasks count
  const tasksList = data?.today_tasks || [];
  const totalTasksCount = tasksList.length || 2;
  const finishedTasksCount = completedTaskIds.size;

  // Streak Week display (Saturday to Friday)
  // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
  // School week order: Sat (6), Sun (0), Mon (1), Tue (2), Wed (3), Thu (4), Fri (5)
  const currentDayOfWeek = now.getDay();
  const schoolWeekDays = [
    { label: 'শ', dayIndex: 6 },
    { label: 'র', dayIndex: 0 },
    { label: 'সো', dayIndex: 1 },
    { label: 'ম', dayIndex: 2 },
    { label: 'বু', dayIndex: 3 },
    { label: 'বৃ', dayIndex: 4 },
    { label: 'শু', dayIndex: 5 },
  ];
  const todaySchoolIndex = schoolWeekDays.findIndex((d) => d.dayIndex === currentDayOfWeek);

  // Pedagogical step index
  const continueLesson = data?.continue_lesson;
  const activeStageIdx = getStageIndex(continueLesson?.current_stage);

  // XP Progress
  const totalXp = data?.gamification?.total_xp ?? 100;
  const nextLevelXp = 250;
  const xpPercent = Math.min(100, Math.round((totalXp / nextLevelXp) * 100));

  // Upcoming Exam
  const upcomingExam = data?.upcoming_exams?.[0];

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['student']}>
        <div className="student-desk-app">
          <aside className="desk-side" aria-label="মেনু">
            <div className="desk-logo">
              <span className="desk-logo-mark" aria-hidden="true">প</span>
              <span className="desk-logo-word">পড়া হবে<em>!</em></span>
            </div>
          </aside>
          <div className="desk-main">
            <header className="desk-top">
              <div className="desk-logo mlogo">
                <span className="desk-logo-mark">প</span>
                <span className="desk-logo-word">পড়া হবে<em>!</em></span>
              </div>
            </header>
            <main className="desk-board" style={{ opacity: 0.6 }}>
              <div style={{ height: 64, background: 'var(--slate-2)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 110, background: 'var(--slate-2)', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 220, background: 'var(--slate-2)', borderRadius: 26, animation: 'pulse 1.5s infinite' }} />
            </main>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['student']}>
      <div className="student-desk-app">
        {/* ====================================================================
            SVG ICON SPRITE (Exact SVG symbols from Student-Dashboard.html)
            ==================================================================== */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <symbol id="i-home" viewBox="0 0 24 24">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
          </symbol>
          <symbol id="i-tutor" viewBox="0 0 24 24">
            <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            <path d="M8 10.5h8M8 13.5h5" />
          </symbol>
          <symbol id="i-book" viewBox="0 0 24 24">
            <path d="M4 6c2.5-1.5 5.5-1.5 8 .5 2.5-2 5.5-2 8-.5v13c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z" />
            <path d="M12 6.5V19.5" />
          </symbol>
          <symbol id="i-cal" viewBox="0 0 24 24">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </symbol>
          <symbol id="i-test" viewBox="0 0 24 24">
            <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
            <path d="M14 3.5V8h4M9 13l2 2 4-4" />
          </symbol>
          <symbol id="i-chart" viewBox="0 0 24 24">
            <path d="M4 20h16M7 16v-4M12 16V8M17 16v-6" />
          </symbol>
          <symbol id="i-group" viewBox="0 0 24 24">
            <circle cx="9" cy="8.5" r="3" />
            <circle cx="17" cy="10" r="2.3" />
            <path d="M3.5 19c.5-3.4 2.8-5.4 5.5-5.4s5 2 5.5 5.4M14.3 19c.3-2.3 1.4-3.8 2.9-3.8s2.8 1.5 3.1 3.8" />
          </symbol>
          <symbol id="i-khata" viewBox="0 0 24 24">
            <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
            <path d="M8 3.5v17M11 8h5M11 11.5h5M11 15h3" />
          </symbol>
          <symbol id="i-teacher" viewBox="0 0 24 24">
            <path d="M2.5 9 12 5l9.5 4L12 13z" />
            <path d="M6.5 11v4.5c1.6 1.5 3.5 2.2 5.5 2.2s3.9-.7 5.5-2.2V11M21.5 9v5" />
          </symbol>
          <symbol id="i-bell" viewBox="0 0 24 24">
            <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
            <path d="M10 20.5a2 2 0 0 0 4 0" />
          </symbol>
          <symbol id="i-search" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </symbol>
          <symbol id="i-snow" viewBox="0 0 24 24">
            <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
          </symbol>
          <symbol id="i-family" viewBox="0 0 24 24">
            <path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" />
          </symbol>
          <symbol id="i-info" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </symbol>
          <symbol id="i-more" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.3" />
            <circle cx="12" cy="12" r="1.3" />
            <circle cx="19" cy="12" r="1.3" />
          </symbol>
        </svg>

        {/* ====================================================================
            SIDEBAR (The Shelf)
            ==================================================================== */}
        <aside className="desk-side" aria-label="মেনু">
          <Link className="desk-logo" href="/home">
            <span className="desk-logo-mark" aria-hidden="true">প</span>
            <span className="desk-logo-word">পড়া হবে<em>!</em></span>
          </Link>

          <nav className="desk-nav" aria-label="প্রধান মেনু">
            <div className="desk-nav-group">
              <Link href="/home" aria-current="page" title="আজ">
                <svg className="desk-ico"><use href="#i-home" /></svg>
                <span>আজ</span>
              </Link>
              <Link href="/tutor" title="AI Tutor">
                <svg className="desk-ico"><use href="#i-tutor" /></svg>
                <span>AI Tutor</span>
              </Link>
              <Link href="/planner" title="পড়ার রুটিন">
                <svg className="desk-ico"><use href="#i-cal" /></svg>
                <span>পড়ার রুটিন</span>
              </Link>
            </div>

            <div className="desk-nav-group">
              <p className="desk-nav-label">পড়া</p>
              <Link href="/materials" title="বই ও নোট">
                <svg className="desk-ico"><use href="#i-book" /></svg>
                <span>বই ও নোট</span>
              </Link>
              <Link href="/exams" title="মডেল টেস্ট">
                <svg className="desk-ico"><use href="#i-test" /></svg>
                <span>মডেল টেস্ট</span>
              </Link>
              <Link href="/scripts" title="খাতা মূল্যায়ন">
                <svg className="desk-ico"><use href="#i-khata" /></svg>
                <span>খাতা মূল্যায়ন</span>
                <span className="pill new">নতুন</span>
              </Link>
              <Link href="/analytics" title="অগ্রগতি">
                <svg className="desk-ico"><use href="#i-chart" /></svg>
                <span>অগ্রগতি</span>
              </Link>
            </div>

            <div className="desk-nav-group">
              <p className="desk-nav-label">একসাথে</p>
              <Link href="/group-learning" title="পড়ার আড্ডা">
                <svg className="desk-ico"><use href="#i-group" /></svg>
                <span>পড়ার আড্ডা</span>
                <span className="pill">৩–৫ জন</span>
              </Link>
              <Link href="/teachers" title="শিক্ষক বুকিং">
                <svg className="desk-ico"><use href="#i-teacher" /></svg>
                <span>শিক্ষক বুকিং</span>
              </Link>
            </div>
          </nav>

          <div className="desk-quota">
            <div className="t">
              <span>Tutor-কে প্রশ্ন</span>
              <b className="desk-num">২/৩০০</b>
            </div>
            <div className="desk-meter">
              <i style={{ width: '0.7%' }} />
            </div>
            <small>এই মাসে আরও ২৯৮টা প্রশ্ন করতে পারবে</small>
          </div>

          <Link className="desk-plan" href="/parent/billing">
            <svg className="desk-ico"><use href="#i-family" /></svg>
            <span>
              <b>ফ্যামিলি প্যাক</b>
              ৪ জন পর্যন্ত ভাইবোন
            </span>
          </Link>
        </aside>

        {/* ====================================================================
            MAIN (The Desk)
            ==================================================================== */}
        <div className="desk-main">
          {/* Top Bar */}
          <header className="desk-top">
            <Link className="desk-logo mlogo" href="/home">
              <span className="desk-logo-mark" aria-hidden="true">প</span>
              <span className="desk-logo-word">পড়া হবে<em>!</em></span>
            </Link>

            <label className="desk-search" htmlFor="deskQ">
              <svg className="desk-ico"><use href="#i-search" /></svg>
              <input
                id="deskQ"
                ref={searchInputRef}
                type="search"
                placeholder="অধ্যায়, টপিক বা প্রশ্ন খোঁজো"
              />
              <kbd>/</kbd>
            </label>

            <div className="desk-top-act">
              <button
                className="desk-iconbtn"
                type="button"
                aria-label="নোটিফিকেশন, ১টি নতুন"
              >
                <svg className="desk-ico"><use href="#i-bell" /></svg>
                <span className="dot" />
              </button>

              <div className="relative">
                <button
                  className="desk-me"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label={`প্রোফাইল: ${studentName}`}
                >
                  <span className="av" aria-hidden="true">{studentInitial}</span>
                  <span>
                    {studentName}
                    <small>ক্লাস {toBanglaNumerals(classLevel)} · {mediumBn}</small>
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="desk-dropdown">
                    <Link href="/analytics" onClick={() => setUserDropdownOpen(false)}>
                      <svg className="desk-ico" style={{ width: 16, height: 16 }}><use href="#i-chart" /></svg>
                      আমার শিখন প্রোফাইল
                    </Link>
                    <Link href="/parent/billing" onClick={() => setUserDropdownOpen(false)}>
                      <svg className="desk-ico" style={{ width: 16, height: 16 }}><use href="#i-family" /></svg>
                      সাবস্ক্রিপশন ও বিলিং
                    </Link>
                    <button
                      type="button"
                      className="logout"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <svg className="desk-ico" style={{ width: 16, height: 16, stroke: '#FF6152' }} viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      লগআউট করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Desk Surface */}
          <main className="desk-board">
            {/* Design Note Rationale Banner */}
            {showNotes && (
              <p className="desk-dnote">
                <b>WHAT CHANGED VS THE OLD DASHBOARD</b>
                <br />
                1. Four identical stat tiles with coloured side rails → one &quot;ledger&quot; strip; the streak gets the most room because it drives daily return.
                <br />
                2. Internal codes never reach the student: no CHECK_PREREQUISITES, BADGE_SCHOLAR_STARTER, NCTB-2026-BM-v1.0, STU-2026-DEMO. Show human words (&quot;শুরুর আগে: আগের পড়া একটু ঝালাই&quot;).
                <br />
                3. One clear next action: the chalk-white card. Everything else is quiet.
                <br />
                4. 0% bars are replaced by an empty state that says how to fill them.
                <br />
                5. Greeting includes a one-line summary sentence, so the page is understood in 3 seconds.
              </p>
            )}

            {/* Error Banner with Retry */}
            {isError && (
              <div style={{
                background: 'rgba(255, 97, 82, 0.1)',
                border: '1px solid var(--redpen)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
                <div>
                  <b style={{ color: 'var(--redpen)', display: 'block' }}>ড্যাশবোর্ড তথ্য লোড হতে সাময়িক বিলম্ব</b>
                  <small style={{ color: 'var(--chalk-2)' }}>
                    {(error as Error)?.message || 'সার্ভারের সাথে পুনরায় যোগাযোগের চেষ্টা করুন।'}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  style={{
                    background: 'var(--slate-3)',
                    border: '1px solid var(--rule-2)',
                    color: 'var(--chalk)',
                    padding: '8px 16px',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  পুনরায় চেষ্টা করুন
                </button>
              </div>
            )}

            {/* 1. Greeting Row */}
            <section className="desk-hello" aria-labelledby="deskHi">
              <div>
                <p className="desk-date">
                  <span>{gregorianDateBn}</span>
                  <span className="bd">{bongabdoDateBn}</span>
                </p>
                <h1 id="deskHi">
                  {greeting}, <em>{firstName}!</em>
                </h1>
                <p className="desk-summary">
                  {remainingMins > 0 ? (
                    <>
                      আজ <b>{toBanglaNumerals(currentActiveMins)} মিনিট</b> পড়েছো, লক্ষ্যের আর <b>{toBanglaNumerals(remainingMins)} মিনিট</b> বাকি। একটা লেসন শেষ করলেই আজকের লক্ষ্য পূরণ, স্ট্রিকও থাকবে।
                    </>
                  ) : (
                    <>
                      আজকের পড়ার লক্ষ্য <b>{toBanglaNumerals(currentActiveMins)} মিনিট</b> পূরণ হয়েছে! দুর্দান্ত অগ্রগতি, স্ট্রিক ধরে রাখো।
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* 2. Ledger Strip */}
            <section className="desk-ledger" aria-label="আজকের হিসাব">
              {/* Streak */}
              <div>
                <span className="desk-lab">
                  <span>টানা পড়ার স্ট্রিক</span>
                  <span className="desk-freeze" title="একদিন মিস হলেও স্ট্রিক ভাঙবে না">
                    <svg className="desk-ico"><use href="#i-snow" /></svg>
                    ফ্রিজ {toBanglaNumerals(data?.streak?.freezes_available ?? 1)}টি
                  </span>
                </span>
                <span className="desk-val desk-num">
                  {toBanglaNumerals(data?.streak?.current_days ?? 3)} <small>দিন</small>
                </span>
                <div className="desk-week" aria-label="এই সপ্তাহের পড়ার ট্র্যাকার">
                  {schoolWeekDays.map((d, idx) => {
                    const isToday = idx === todaySchoolIndex;
                    // Days strictly before today in the week are marked done if student has streak
                    const isDone = idx < todaySchoolIndex && (data?.streak?.current_days ?? 0) >= (todaySchoolIndex - idx);
                    return (
                      <span
                        key={d.label}
                        className={isToday ? 'today' : isDone ? 'd' : ''}
                      >
                        <i />
                        {d.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Today's Goal Ring */}
              <div>
                <span className="desk-lab">আজকের লক্ষ্য</span>
                <div className="desk-mini-ring">
                  <svg viewBox="0 0 50 50" aria-hidden="true">
                    <circle className="bg" cx="25" cy="25" r="20" />
                    <circle
                      className="fg"
                      cx="25"
                      cy="25"
                      r="20"
                      strokeDasharray="125.7"
                      strokeDashoffset={ringDashOffset}
                    />
                  </svg>
                  <span className="desk-val desk-num">
                    {toBanglaNumerals(currentActiveMins)}
                    <small>/{toBanglaNumerals(targetMins)} মি</small>
                  </span>
                </div>
              </div>

              {/* Tasks Count */}
              <div>
                <span className="desk-lab">আজকের কাজ</span>
                <span className="desk-val desk-num">
                  {toBanglaNumerals(finishedTasksCount)}
                  <small>/{toBanglaNumerals(totalTasksCount)} শেষ</small>
                </span>
              </div>

              {/* Total XP */}
              <div>
                <span className="desk-lab">মোট XP</span>
                <span className="desk-val desk-num">
                  {toBanglaNumerals(totalXp)} <small>XP</small>
                </span>
                <small style={{ color: 'var(--chalk-3)', fontSize: '0.78rem' }}>
                  পরের লেভেল {toBanglaNumerals(nextLevelXp)} XP-তে
                </small>
              </div>
            </section>

            {/* 3. The One Bright Card (.now) */}
            <section className="desk-now" aria-labelledby="nowh">
              <div>
                <div className="desk-crumb">
                  <span className="live">চলমান</span>
                  <b>{continueLesson?.subject_title_bn || 'গণিত'}</b>
                  <span>›</span>
                  <span>অধ্যায় ৩: {continueLesson?.chapter_title_bn || 'বীজগাণিতিক রাশি'}</span>
                </div>
                <h2 id="nowh">
                  <span className="goal-l">এই লেসন শেষে তুমি পারবে</span>
                  <span>{continueLesson?.title_bn || 'বীজগাণিতিক প্রতীক, চলক ও সহগ চিনে নিতে'}</span>
                </h2>
              </div>

              <div className="desk-now-side">
                <Link
                  className="desk-go"
                  href={
                    continueLesson?.session_uuid
                      ? `/tutor?session=${continueLesson.session_uuid}`
                      : '/tutor'
                  }
                >
                  পাঠ চালিয়ে যাও <span className="arr" aria-hidden="true">→</span>
                </Link>
                <small>আর আনুমানিক ১৫ মিনিট</small>
              </div>

              {/* 5-step pedagogical indicator */}
              <ol className="desk-steps" aria-label="লেসনের ধাপ">
                {STAGES.map((stageName, idx) => {
                  let statusClass = '';
                  if (idx === activeStageIdx) statusClass = 'cur';
                  else if (idx < activeStageIdx) statusClass = 'passed';
                  return (
                    <li key={stageName} className={statusClass}>
                      <span>{stageName}</span>
                    </li>
                  );
                })}
              </ol>

              {/* Ask Tutor Mini Box */}
              <form className="desk-ask" onSubmit={handleAskSubmit}>
                <span className="ava" aria-hidden="true">প</span>
                <input
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  placeholder="এই অধ্যায় নিয়ে Tutor-কে কিছু জিজ্ঞেস করো…"
                  aria-label="Tutor-কে প্রশ্ন"
                />
                <button type="submit">জিজ্ঞেস করো</button>
              </form>

              {/* Tutor Response Bubble */}
              {replyText && (
                <div className="desk-reply">
                  <span className="ava" aria-hidden="true">প</span>
                  <div className="bub">{replyText}</div>
                </div>
              )}
            </section>

            {/* 4. Routine & Mastery Panels Grid */}
            <div className="desk-grid">
              {/* Routine Panel */}
              <section className="desk-panel" aria-labelledby="rt">
                <div className="desk-ph">
                  <h3 id="rt">আজকের রুটিন</h3>
                  <Link href="/planner">পুরো সপ্তাহ →</Link>
                  <p>তোমার ভুল আর গতি দেখে Tutor আজকের জন্য এগুলো বেছেছে</p>
                </div>

                <ul className="desk-tl">
                  {tasksList.length > 0 ? (
                    tasksList.map((task, idx) => {
                      const isDone = completedTaskIds.has(task.id);
                      const prevTask = tasksList[idx - 1];
                      const isFirstUndone = !isDone && (idx === 0 || (prevTask !== undefined && completedTaskIds.has(prevTask.id)));
                      const itemTime = idx === 0 ? 'এখন' : '৮:১৫';

                      return (
                        <li
                          key={task.id}
                          className={`${isDone ? 'done' : ''} ${isFirstUndone ? 'on' : ''}`}
                        >
                          <time>{itemTime}</time>
                          <button
                            className="chk"
                            type="button"
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={`${task.title_bn} শেষ হয়েছে চিহ্ন দাও`}
                            onClick={() => handleToggleTask(task.id)}
                          />
                          <div className="what">
                            <b>{task.title_bn}</b>
                            <small>
                              <span className="desk-subj">{task.subject_title_bn}</span>· {toBanglaNumerals(task.estimated_minutes)} মিনিট {idx === 1 ? '· গত কুইজে ২টি ভুল ছিল' : '· ১০টি অঙ্ক'}
                            </small>
                          </div>
                          <Link
                            className="start"
                            href={continueLesson?.session_uuid ? `/tutor?session=${continueLesson.session_uuid}` : '/tutor'}
                          >
                            শুরু করো
                          </Link>
                        </li>
                      );
                    })
                  ) : (
                    <li className="on">
                      <time>এখন</time>
                      <button className="chk" type="button" role="checkbox" aria-checked="false" />
                      <div className="what">
                        <b>বর্গের সূত্রাবলি অনুশীলন</b>
                        <small><span className="desk-subj">গণিত</span>· ২৫ মিনিট · ১০টা অঙ্ক</small>
                      </div>
                      <Link className="start" href="/tutor">শুরু করো</Link>
                    </li>
                  )}
                </ul>

                <div className="desk-tl-foot">
                  <span>
                    আজ মোট <b>{toBanglaNumerals(targetMins)} মিনিট</b>
                  </span>
                  <span>
                    রুটিন বদলাতে চাও? <Link href="/planner" style={{ color: 'var(--marigold)' }}>সময় ঠিক করো</Link>
                  </span>
                </div>
              </section>

              {/* Subject Mastery Panel */}
              <section className="desk-panel" aria-labelledby="ms">
                <div className="desk-ph">
                  <h3 id="ms">কোন বিষয়ে কতটা পোক্ত</h3>
                  <Link href="/analytics">বিস্তারিত →</Link>
                  <p>অধ্যায়ের কুইজ আর অনুশীলন থেকে হিসাব হয়</p>
                </div>

                <div className="desk-mast">
                  {/* Math Mastery */}
                  <div className="desk-mrow">
                    <div className="top-l">
                      <b>গণিত</b>
                      <span className="st">
                        {toBanglaNumerals(data?.subject_mastery?.[0]?.total_objectives ?? 4)}টি শিখনফলের {toBanglaNumerals(data?.subject_mastery?.[0]?.mastered_objectives ?? 0)}টি পোক্ত
                      </span>
                    </div>
                    <div className="desk-blocks" style={{ '--n': 4 } as React.CSSProperties}>
                      <i className="part">চলছে</i>
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="cta">
                      <span>বীজগাণিতিক রাশির কুইজ দিলেই প্রথম ঘর ভরবে</span>
                      <Link href="/materials">অধ্যায় দেখো →</Link>
                    </div>
                  </div>

                  {/* Science Mastery */}
                  <div className="desk-mrow">
                    <div className="top-l">
                      <b>বিজ্ঞান</b>
                      <span className="st">
                        {toBanglaNumerals(data?.subject_mastery?.[1]?.total_objectives ?? 2)}টি শিখনফলের {toBanglaNumerals(data?.subject_mastery?.[1]?.mastered_objectives ?? 0)}টি পোক্ত
                      </span>
                    </div>
                    <div className="desk-blocks" style={{ '--n': 2 } as React.CSSProperties}>
                      <i />
                      <i />
                    </div>
                    <div className="cta">
                      <span>এখনো শুরু হয়নি</span>
                      <Link href="/materials">প্রথম লেসন →</Link>
                    </div>
                  </div>

                  <p className="desk-note-empty">
                    <svg className="desk-ico"><use href="#i-info" /></svg>
                    প্রতিটা ঘর একটা শিখনফল। কুইজে ৮০% পেলে ঘরটা সবুজ হবে।
                  </p>
                </div>
              </section>
            </div>

            {/* 5. Bottom Row: Badges, Khata Upload, Model Test */}
            <div className="desk-row3">
              {/* Badges Shelf */}
              <section className="desk-panel" aria-labelledby="bd">
                <div className="desk-ph">
                  <h3 id="bd">অর্জন</h3>
                  <Link href="/analytics">সব দেখো →</Link>
                </div>
                <div className="desk-shelf">
                  {/* Badge 1 */}
                  <div className="desk-bdg">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <path
                        d="M30 3l6 5 8-1 3 7 7 4-1 8 5 6-5 6 1 8-7 4-3 7-8-1-6 5-6-5-8 1-3-7-7-4 1-8-5-6 5-6-1-8 7-4 3-7 8 1z"
                        fill="#FFB238"
                      />
                      <text
                        x="30"
                        y="37"
                        textAnchor="middle"
                        fontFamily="Anek Bangla"
                        fontWeight="800"
                        fontSize="16"
                        fill="#241600"
                      >
                        ৫০+
                      </text>
                    </svg>
                    উদ্যমী শিক্ষার্থী
                    <small style={{ color: 'var(--chalk-3)' }}>৫০ XP পার</small>
                  </div>

                  {/* Badge 2 */}
                  <div className="desk-bdg">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <circle
                        cx="30"
                        cy="30"
                        r="26"
                        fill="none"
                        stroke="#FFB238"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                      <circle cx="30" cy="30" r="19" fill="#EDE8DA" />
                      <text
                        x="30"
                        y="37"
                        textAnchor="middle"
                        fontFamily="Anek Bangla"
                        fontWeight="800"
                        fontSize="19"
                        fill="#14201B"
                      >
                        ৩
                      </text>
                    </svg>
                    ধারাবাহিক সাধক
                    <small style={{ color: 'var(--chalk-3)' }}>৩ দিনের স্ট্রিক</small>
                  </div>

                  {/* Badge 3 (Locked) */}
                  <div className="desk-bdg lock">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke="#7E8A80"
                        strokeWidth="2"
                        strokeDasharray="3 5"
                      />
                      <text
                        x="30"
                        y="37"
                        textAnchor="middle"
                        fontFamily="Anek Bangla"
                        fontWeight="800"
                        fontSize="19"
                        fill="#7E8A80"
                      >
                        ৭
                      </text>
                    </svg>
                    ৭ দিনের স্ট্রিক
                    <span className="prog">
                      <i style={{ width: '43%' }} />
                    </span>
                    <small>আর ৪ দিন</small>
                  </div>
                </div>

                <div className="desk-xp">
                  <span>লেভেল ১</span>
                  <div className="desk-meter">
                    <i style={{ width: `${xpPercent}%` }} />
                  </div>
                  <b className="desk-num">
                    {toBanglaNumerals(totalXp)}/{toBanglaNumerals(nextLevelXp)} XP
                  </b>
                </div>
              </section>

              {/* Khata Upload Dropzone */}
              <section className="desk-panel desk-drop" aria-labelledby="kh">
                <div className="desk-ph" style={{ margin: 0, width: '100%' }}>
                  <h3 id="kh">খাতা দেখাও</h3>
                  <Link href="/scripts">আগের খাতা →</Link>
                  <p>হাতে লেখা উত্তরের ছবি দাও, Tutor ধাপে ধাপে মতামত দেবে</p>
                </div>

                <label
                  className={`desk-drop-zone ${isDragOver ? 'over' : ''}`}
                  htmlFor="khataFileInput"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <span className="desk-mini-khata" aria-hidden="true" />
                  <span>
                    <b>খাতার ছবি তোলো বা এখানে টেনে আনো</b>
                    <small>JPG, PNG বা PDF · এক পাতা বা একাধিক</small>
                  </span>
                  <input
                    id="khataFileInput"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>

                {uploadedFilesCount !== null && (
                  <span className="desk-upl">
                    {toBanglaNumerals(uploadedFilesCount)}টা পাতা নেওয়া হয়েছে · মূল্যায়ন শুরু হচ্ছে (ডেমো)
                  </span>
                )}

                <p className="desk-why">নম্বরটা প্রস্তাবিত, তুমি বা শিক্ষক রিভিউ করতে পারবে।</p>
              </section>

              {/* Next Model Test */}
              <section className="desk-panel desk-test" aria-labelledby="ts">
                <div className="desk-ph" style={{ margin: 0 }}>
                  <h3 id="ts">পরের মডেল টেস্ট</h3>
                </div>
                <p className="big">
                  {upcomingExam?.title_bn || 'বীজগাণিতিক রাশি'}
                  <br />
                  <span style={{ color: 'var(--chalk-3)', fontSize: '0.75em', fontWeight: 600 }}>
                    শুক্রবার, সন্ধ্যা ৭টা
                  </span>
                </p>
                <div className="meta">
                  <span className="desk-chip">২০টি MCQ</span>
                  <span className="desk-chip">২টি সৃজনশীল</span>
                  <span className="desk-chip">
                    {toBanglaNumerals(upcomingExam?.duration_minutes ?? 40)} মিনিট
                  </span>
                </div>
                <Link className="desk-cta-line" href="/exams">
                  এখনই প্র্যাকটিস টেস্ট দাও →
                </Link>
                <p className="desk-why">প্র্যাকটিস টেস্টের নম্বর রিপোর্টে যোগ হয় না।</p>
              </section>
            </div>
          </main>
        </div>

        {/* ====================================================================
            MOBILE BOTTOM TAB BAR (Displays on small screens <= 720px)
            ==================================================================== */}
        <nav className="desk-tabbar" aria-label="মোবাইল মেনু">
          <Link href="/home" aria-current="page">
            <svg className="desk-ico"><use href="#i-home" /></svg>
            আজ
          </Link>
          <Link href="/planner">
            <svg className="desk-ico"><use href="#i-cal" /></svg>
            রুটিন
          </Link>
          <Link href="/tutor" className="desk-tab-tutor">
            <svg className="desk-ico"><use href="#i-tutor" /></svg>
            Tutor
          </Link>
          <Link href="/exams">
            <svg className="desk-ico"><use href="#i-test" /></svg>
            টেস্ট
          </Link>
          <Link href="/analytics">
            <svg className="desk-ico"><use href="#i-more" /></svg>
            আরও
          </Link>
        </nav>

        {/* ====================================================================
            FLOATING "ডিজাইন নোট" BUTTON (Toggle Design Notes Rationale Banner)
            ==================================================================== */}
        <button
          className="desk-notes-toggle"
          type="button"
          aria-pressed={showNotes}
          onClick={() => setShowNotes(!showNotes)}
        >
          <i />
          ডিজাইন নোট
        </button>
      </div>
    </RoleGuard>
  );
}
