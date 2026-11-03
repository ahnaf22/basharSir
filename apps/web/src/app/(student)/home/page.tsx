'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { StudyDeskShell } from '@/components/layout/StudyDeskShell';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import {
  fetchStudentDashboardApi,
  setStudyTaskStatusApi,
  type StudentDashboardDto,
} from '@/features/dashboard/api/student-dashboard.api';
import {
  LESSON_STEPS,
  buildRoutineTimes,
  computeGoalProgress,
  describeWeek,
  masteryHeadline,
  pickHeroLesson,
  taskDetailLine,
  toBadgeView,
  weekdayShort,
} from '@/features/dashboard/lib/dashboard-view';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  getTimeOfDayGreeting,
  formatGregorianBanglaDate,
  formatBongabdoDate,
} from '@/lib/bangla-date';

const DASHBOARD_KEY = ['student-dashboard'] as const;
const RING_CIRCUMFERENCE = 125.7;

export default function StudentHomePage(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const askInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: async () => (await fetchStudentDashboardApi()).data,
    staleTime: 30_000,
  });

  const [askQuery, setAskQuery] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);

  /* ---- task completion: persisted through the planner API, optimistic in cache ---- */
  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: number; done: boolean }) =>
      setStudyTaskStatusApi(id, done ? 'completed' : 'scheduled'),
    onMutate: async ({ id, done }) => {
      setTaskError(null);
      await queryClient.cancelQueries({ queryKey: DASHBOARD_KEY });
      const previous = queryClient.getQueryData<StudentDashboardDto>(DASHBOARD_KEY);
      if (previous) {
        queryClient.setQueryData<StudentDashboardDto>(DASHBOARD_KEY, {
          ...previous,
          today_tasks: previous.today_tasks.map((t) =>
            t.id === id ? { ...t, status: done ? 'completed' : 'scheduled' } : t,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(DASHBOARD_KEY, ctx.previous);
      setTaskError('কাজটি সেভ করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });

  /* ---- derived view state ---- */
  const now = new Date();
  const greeting = getTimeOfDayGreeting(now);
  const gregorianDateBn = formatGregorianBanglaDate(now);
  const bongabdoDateBn = formatBongabdoDate(now);

  const tasks = data?.today_tasks ?? [];
  const doneIds = useMemo(
    () => new Set(tasks.filter((t) => t.status === 'completed').map((t) => t.id)),
    [tasks],
  );
  const routineTimes = buildRoutineTimes(tasks, doneIds, now);
  const firstPendingId = tasks.find((t) => !doneIds.has(t.id))?.id;

  const studentName = data?.student?.name_bn || data?.student?.name_en || user?.name_bn || user?.name_en || '';
  const firstName = studentName.split(' ')[0] ?? studentName;

  const goal = computeGoalProgress(
    data?.today_study_time?.active_minutes ?? 0,
    data?.today_study_time?.target_minutes ?? data?.student?.daily_study_target_mins ?? 45,
  );
  const ringDashOffset = RING_CIRCUMFERENCE * (1 - goal.fraction);

  const hero = pickHeroLesson(data);
  const week = data?.streak?.week ?? [];
  const streakDays = data?.streak?.current_days ?? 0;
  const milestone = data?.streak?.next_milestone;

  const xp = data?.gamification?.total_xp ?? 0;
  const level = data?.gamification?.level;
  const xpMeterPct = level ? Math.round((level.xp_into_level / level.xp_per_level) * 100) : 0;

  const earnedBadges = (data?.gamification?.badges ?? []).slice(0, 2).map(toBadgeView);
  const showLockedMilestone = Boolean(milestone && milestone.remaining_days > 0);
  const milestoneProgress =
    milestone && milestone.target_days > 0
      ? Math.round((streakDays / milestone.target_days) * 100)
      : 0;

  const exam = data?.upcoming_exams?.[0];

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = askQuery.trim();
    if (!q) {
      askInputRef.current?.focus();
      return;
    }
    // The tutor is a state machine: free text is composed inside the lesson workspace,
    // where the backend validates the turn. The dashboard only hands the question over.
    const base = hero?.href ?? '/tutor';
    router.push(`${base}${base.includes('?') ? '&' : '?'}q=${encodeURIComponent(q)}`);
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['student']}>
        <StudyDeskShell variant="home">
          <div aria-busy="true" style={{ display: 'grid', gap: 22, opacity: 0.6 }}>
            <div style={{ height: 64, background: 'var(--slate-2)', borderRadius: 16 }} />
            <div style={{ height: 110, background: 'var(--slate-2)', borderRadius: 20 }} />
            <div style={{ height: 220, background: 'var(--slate-2)', borderRadius: 26 }} />
          </div>
        </StudyDeskShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['student']}>
      <StudyDeskShell variant="home">
            {isError && (
              <div
                role="alert"
                style={{
                  background: 'rgba(255, 97, 82, 0.1)',
                  border: '1px solid var(--redpen)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <b style={{ color: 'var(--redpen)', display: 'block' }}>ড্যাশবোর্ডের তথ্য আনা যায়নি</b>
                  <small style={{ color: 'var(--chalk-2)' }}>
                    {(error as Error)?.message || 'ইন্টারনেট দেখে আবার চেষ্টা করো।'}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  style={{
                    background: 'var(--slate-3)',
                    border: '1px solid var(--rule-2)',
                    color: 'var(--chalk)',
                    padding: '8px 16px',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  আবার চেষ্টা করো
                </button>
              </div>
            )}

            {/* 1. Greeting */}
            <section className="hello" aria-labelledby="hi">
              <div>
                <p className="date">
                  <span>{gregorianDateBn}</span>
                  <span className="bd">{bongabdoDateBn}</span>
                </p>
                <h1 id="hi">
                  {greeting}, <em>{firstName}!</em>
                </h1>
                <p className="summary">
                  {goal.minutes === 0 ? (
                    <>
                      আজকের লক্ষ্য <b>{toBanglaNumerals(goal.target)} মিনিট</b>।{' '}
                      {hero ? 'লেসনটা শুরু করলেই আজকের হিসাব চালু হবে।' : 'রুটিন ঠিক করে পড়া শুরু করো।'}
                    </>
                  ) : goal.remaining > 0 ? (
                    <>
                      আজ <b>{toBanglaNumerals(goal.minutes)} মিনিট</b> পড়েছো, লক্ষ্যের আর{' '}
                      <b>{toBanglaNumerals(goal.remaining)} মিনিট</b> বাকি।
                      {streakDays > 0 && ' আজকের লক্ষ্য পূরণ করলে স্ট্রিক থাকবে।'}
                    </>
                  ) : (
                    <>
                      আজকের লক্ষ্য পূরণ! <b>{toBanglaNumerals(goal.minutes)} মিনিট</b> পড়েছো
                      {streakDays > 0 && <>, স্ট্রিক এখন <b>{toBanglaNumerals(streakDays)} দিন</b></>}।
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* 2. Ledger */}
            <section className="ledger" aria-label="আজকের হিসাব">
              <div>
                <span className="lab">
                  <span>টানা পড়ার স্ট্রিক</span>
                  {(data?.streak?.freezes_available ?? 0) > 0 && (
                    <span className="freeze" title="একদিন মিস হলেও স্ট্রিক ভাঙবে না">
                      <svg className="ico"><use href="#i-snow" /></svg>
                      ফ্রিজ {toBanglaNumerals(data?.streak?.freezes_available ?? 0)}টি
                    </span>
                  )}
                </span>
                <span className="val num">
                  {toBanglaNumerals(streakDays)} <small>দিন</small>
                </span>
                <div className="week" aria-label={describeWeek(week)}>
                  {week.map((d) => (
                    <span
                      key={d.date}
                      className={d.is_today ? 'today' : d.studied ? 'd' : ''}
                    >
                      <i />
                      {weekdayShort(d.weekday)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="lab">আজকের লক্ষ্য</span>
                <div className="mini-ring">
                  <svg viewBox="0 0 50 50" aria-hidden="true">
                    <circle className="bg" cx="25" cy="25" r="20" />
                    <circle
                      className="fg"
                      id="goalRing"
                      cx="25"
                      cy="25"
                      r="20"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringDashOffset}
                    />
                  </svg>
                  <span className="val num">
                    {toBanglaNumerals(goal.minutes)}
                    <small>/{toBanglaNumerals(goal.target)} মি</small>
                  </span>
                </div>
              </div>

              <div>
                <span className="lab">আজকের কাজ</span>
                <span className="val num" id="taskCount">
                  {toBanglaNumerals(doneIds.size)}
                  <small>/{toBanglaNumerals(tasks.length)} শেষ</small>
                </span>
              </div>

              <div>
                <span className="lab">মোট XP</span>
                <span className="val num">
                  {toBanglaNumerals(xp)} <small>XP</small>
                </span>
                {level && (
                  <small style={{ color: 'var(--chalk-3)', fontSize: '.78rem' }}>
                    পরের লেভেল {toBanglaNumerals(level.next_level_total_xp)} XP-তে
                  </small>
                )}
              </div>
            </section>

            {/* 3. The one bright card */}
            <section className="now" aria-labelledby="nowh">
              {hero ? (
                <>
                  <div>
                    <div className="crumb">
                      {hero.isResume && <span className="live">চলমান</span>}
                      <b>{hero.subject}</b>
                      <span>›</span>
                      <span>অধ্যায় {toBanglaNumerals(hero.chapterNumber)}: {hero.chapter}</span>
                    </div>
                    <h2 id="nowh">
                      <span className="goal-l">এই লেসন শেষে তুমি পারবে</span>
                      <span>{hero.title}</span>
                    </h2>
                  </div>

                  <div className="now-side">
                    <Link className="go" href={hero.href}>
                      {hero.cta} <span className="arr" aria-hidden="true">→</span>
                    </Link>
                    {hero.eta && <small>{hero.eta}</small>}
                  </div>

                  <ol className="steps" aria-label="লেসনের ধাপ">
                    {LESSON_STEPS.map((stageName, idx) => (
                      <li
                        key={stageName}
                        className={idx === hero.stageIndex ? 'cur' : idx < hero.stageIndex ? 'passed' : ''}
                        aria-current={idx === hero.stageIndex ? 'step' : undefined}
                      >
                        <span>{stageName}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <>
                  <div>
                    <div className="crumb"><b>আজকের পড়া</b></div>
                    <h2 id="nowh">
                      <span className="goal-l">এখন কোনো লেসন চলছে না</span>
                      <span>রুটিন বানিয়ে প্রথম লেসনটা বেছে নাও</span>
                    </h2>
                  </div>
                  <div className="now-side">
                    <Link className="go" href="/planner">
                      রুটিন বানাও <span className="arr" aria-hidden="true">→</span>
                    </Link>
                    <small>অথবা বই থেকে নিজের অধ্যায় বেছে নাও</small>
                  </div>
                </>
              )}

              <form className="ask" id="ask" onSubmit={handleAskSubmit}>
                <span className="ava" aria-hidden="true">প</span>
                <label
                  htmlFor="askIn"
                  style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
                >
                  Tutor-কে প্রশ্ন
                </label>
                <input
                  id="askIn"
                  ref={askInputRef}
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  placeholder="এই অধ্যায় নিয়ে Tutor-কে কিছু জিজ্ঞেস করো…"
                />
                <button type="submit">জিজ্ঞেস করো</button>
              </form>
            </section>

            <div className="grid">
              {/* Routine */}
              <section className="panel" aria-labelledby="rt">
                <div className="ph">
                  <h3 id="rt">আজকের রুটিন</h3>
                  <Link href="/planner">পুরো সপ্তাহ →</Link>
                  <p>তোমার ভুল আর গতি দেখে Tutor আজকের জন্য এগুলো বেছেছে</p>
                </div>

                {tasks.length === 0 ? (
                  <p className="note-empty" style={{ margin: '8px 0 14px' }}>
                    <svg className="ico"><use href="#i-info" /></svg>
                    আজকের জন্য কোনো কাজ ঠিক করা নেই। <Link href="/planner" style={{ color: 'var(--marigold)' }}>রুটিন বানাও →</Link>
                  </p>
                ) : (
                  <ul className="tl" id="tl">
                    {tasks.map((task, idx) => {
                      const isDone = doneIds.has(task.id);
                      const isOn = task.id === firstPendingId;
                      const startHref =
                        task.learning_objective_id !== null
                          ? `/tutor?objective_id=${task.learning_objective_id}`
                          : '/tutor';
                      return (
                        <li key={task.id} className={`${isDone ? 'done' : ''} ${isOn ? 'on' : ''}`.trim()}>
                          <time>{routineTimes[idx]}</time>
                          <button
                            className="chk"
                            type="button"
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={isDone ? 'শেষ চিহ্ন তুলে নাও' : 'শেষ হয়েছে চিহ্ন দাও'}
                            disabled={toggleTask.isPending}
                            onClick={() => toggleTask.mutate({ id: task.id, done: !isDone })}
                          />
                          <div className="what">
                            <b>{task.title_bn}</b>
                            <small>
                              <span className="subj">{task.subject_title_bn}</span>· {taskDetailLine(task)}
                            </small>
                          </div>
                          {!isDone && (
                            <Link
                              className="start"
                              href={
                                hero?.isResume && task.learning_objective_id === data?.continue_lesson?.learning_objective_id
                                  ? hero.href
                                  : startHref
                              }
                            >
                              শুরু করো
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {taskError && (
                  <p role="alert" className="why" style={{ color: 'var(--redpen)' }}>{taskError}</p>
                )}

                <div className="tl-foot">
                  <span>
                    আজ মোট <b>{toBanglaNumerals(tasks.reduce((s, t) => s + t.estimated_minutes, 0))} মিনিট</b>
                  </span>
                  <span>
                    রুটিন বদলাতে চাও? <Link href="/planner" style={{ color: 'var(--marigold)' }}>সময় ঠিক করো</Link>
                  </span>
                </div>
              </section>

              {/* Mastery */}
              <section className="panel" aria-labelledby="ms">
                <div className="ph">
                  <h3 id="ms">কোন বিষয়ে কতটা পোক্ত</h3>
                  <Link href="/analytics">বিস্তারিত →</Link>
                  <p>অধ্যায়ের কুইজ আর অনুশীলন থেকে হিসাব হয়</p>
                </div>

                <div className="mast">
                  {(data?.subject_mastery ?? []).length === 0 && (
                    <p className="note-empty">
                      <svg className="ico"><use href="#i-info" /></svg>
                      তোমার ক্লাসের বিষয় এখনো যোগ হয়নি।
                    </p>
                  )}
                  {(data?.subject_mastery ?? []).map((s) => {
                    const notStarted = s.attempted_objectives === 0;
                    const allDone = s.total_objectives > 0 && s.mastered_objectives === s.total_objectives;
                    return (
                      <div className="mrow" key={s.id}>
                        <div className="top-l">
                          <b>{s.title_bn}</b>
                          <span className="st">{masteryHeadline(s.total_objectives, s.mastered_objectives)}</span>
                        </div>
                        {s.objectives.length > 0 && (
                          <div className="blocks" style={{ '--n': s.objectives.length } as React.CSSProperties}>
                            {s.objectives.map((o) => (
                              <i
                                key={o.id}
                                className={o.state === 'mastered' ? 'done' : o.state === 'in_progress' ? 'part' : ''}
                                aria-label={
                                  o.state === 'mastered' ? 'পোক্ত' : o.state === 'in_progress' ? 'চলছে' : 'শুরু হয়নি'
                                }
                              >
                                {o.state === 'mastered' ? '✓' : o.state === 'in_progress' ? 'চলছে' : ''}
                              </i>
                            ))}
                          </div>
                        )}
                        <div className="cta">
                          {s.total_objectives === 0 ? (
                            <span>এই বিষয়ের শিখনফল এখনো যোগ হয়নি</span>
                          ) : allDone ? (
                            <span>সব শিখনফল পোক্ত, দারুণ!</span>
                          ) : notStarted ? (
                            <>
                              <span>এখনো শুরু হয়নি</span>
                              <Link href="/materials">প্রথম লেসন →</Link>
                            </>
                          ) : (
                            <>
                              <span>
                                {s.next_chapter
                                  ? `${s.next_chapter.title_bn}-এর কুইজ দিলে আরেকটা ঘর ভরবে`
                                  : 'কুইজ দিলে আরেকটা ঘর ভরবে'}
                              </span>
                              <Link href={s.next_chapter ? `/materials?chapter_id=${s.next_chapter.id}` : '/materials'}>
                                অধ্যায় দেখো →
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="note-empty">
                    <svg className="ico"><use href="#i-info" /></svg>
                    প্রতিটা ঘর একটা শিখনফল। কুইজে ৭৫% বা তার বেশি পেলে ঘরটা সবুজ হবে।
                  </p>
                </div>
              </section>
            </div>

            <div className="row3">
              {/* Badges */}
              <section className="panel" aria-labelledby="bd">
                <div className="ph">
                  <h3 id="bd">অর্জন</h3>
                  <Link href="/analytics">সব দেখো →</Link>
                </div>
                <div className="shelf">
                  {earnedBadges.map((b) => (
                    <div className="bdg" key={b.key}>
                      <svg viewBox="0 0 60 60" aria-hidden="true">
                        {b.kind === 'streak' ? (
                          <>
                            <circle cx="30" cy="30" r="26" fill="none" stroke="#FFB238" strokeWidth="2.5" strokeDasharray="4 4" />
                            <circle cx="30" cy="30" r="19" fill="#EDE8DA" />
                            <text x="30" y="37" textAnchor="middle" style={{ fontFamily: 'var(--f-display)' }} fontWeight="800" fontSize="19" fill="#14201B">
                              {b.glyph}
                            </text>
                          </>
                        ) : (
                          <>
                            <path
                              d="M30 3l6 5 8-1 3 7 7 4-1 8 5 6-5 6 1 8-7 4-3 7-8-1-6 5-6-5-8 1-3-7-7-4 1-8-5-6 5-6-1-8 7-4 3-7 8 1z"
                              fill="#FFB238"
                            />
                            <text x="30" y="37" textAnchor="middle" style={{ fontFamily: 'var(--f-display)' }} fontWeight="800" fontSize="18" fill="#241600">
                              {b.glyph}
                            </text>
                          </>
                        )}
                      </svg>
                      {b.title}
                      {b.subtitle && (
                        <>
                          <br />
                          <small style={{ color: 'var(--chalk-3)' }}>{b.subtitle}</small>
                        </>
                      )}
                    </div>
                  ))}

                  {showLockedMilestone && milestone && (
                    <div className="bdg lock">
                      <svg viewBox="0 0 60 60" aria-hidden="true">
                        <circle cx="30" cy="30" r="25" fill="none" stroke="#7E8A80" strokeWidth="2" strokeDasharray="3 5" />
                        <text x="30" y="37" textAnchor="middle" style={{ fontFamily: 'var(--f-display)' }} fontWeight="800" fontSize="19" fill="#8E9A90">
                          {toBanglaNumerals(milestone.target_days)}
                        </text>
                      </svg>
                      {toBanglaNumerals(milestone.target_days)} দিনের স্ট্রিক
                      <span className="prog"><i style={{ width: `${milestoneProgress}%` }} /></span>
                      <small>আর {toBanglaNumerals(milestone.remaining_days)} দিন</small>
                    </div>
                  )}
                </div>
                {earnedBadges.length === 0 && (
                  <p className="why" style={{ marginTop: 10 }}>
                    পড়তে থাকলে এখানে তোমার প্রথম ব্যাজ জমবে।
                  </p>
                )}

                {level && (
                  <div className="xp">
                    <span>লেভেল {toBanglaNumerals(level.number)}</span>
                    <div className="meter"><i style={{ width: `${xpMeterPct}%` }} /></div>
                    <b className="num">
                      {toBanglaNumerals(xp)}/{toBanglaNumerals(level.next_level_total_xp)} XP
                    </b>
                  </div>
                )}
              </section>

              {/* Khata */}
              <section className="panel drop" aria-labelledby="kh">
                <div className="ph" style={{ margin: 0, width: '100%' }}>
                  <h3 id="kh">খাতা দেখাও</h3>
                  <Link href="/scripts">আগের খাতা →</Link>
                  <p>হাতে লেখা উত্তরের ছবি দাও, Tutor ধাপে ধাপে মতামত দেবে</p>
                </div>

                <Link className="drop-zone" href="/scripts" id="drop">
                  <span className="mini-khata" aria-hidden="true" />
                  <span>
                    <b>খাতার ছবি তোলো বা আপলোড করো</b>
                    <small>JPG, PNG বা PDF · এক পাতা বা একাধিক</small>
                  </span>
                </Link>

                <p className="why">নম্বরটা প্রস্তাবিত, তুমি বা শিক্ষক রিভিউ করতে পারবে।</p>
              </section>

              {/* Next test */}
              <section className="panel test" aria-labelledby="ts">
                <div className="ph" style={{ margin: 0 }}>
                  <h3 id="ts">পরের মডেল টেস্ট</h3>
                </div>
                {exam ? (
                  <>
                    <p className="big">
                      {exam.title_bn}
                      <br />
                      <span style={{ color: 'var(--chalk-3)', fontSize: '.75em', fontWeight: 600 }}>
                        {exam.subject_title_bn}
                      </span>
                    </p>
                    <div className="meta">
                      {exam.mcq_count > 0 && <span className="chip">{toBanglaNumerals(exam.mcq_count)}টি MCQ</span>}
                      {exam.creative_count > 0 && (
                        <span className="chip">{toBanglaNumerals(exam.creative_count)}টি সৃজনশীল</span>
                      )}
                      <span className="chip">{toBanglaNumerals(exam.duration_minutes)} মিনিট</span>
                      <span className="chip">পূর্ণমান {toBanglaNumerals(Number(exam.total_marks))}</span>
                    </div>
                    <Link className="cta-line" href="/exams">
                      এখনই প্র্যাকটিস টেস্ট দাও →
                    </Link>
                    <p className="why">প্র্যাকটিস টেস্টের নম্বর রিপোর্টে যোগ হয় না।</p>
                  </>
                ) : (
                  <>
                    <p className="big">
                      <span style={{ color: 'var(--chalk-3)', fontSize: '.75em', fontWeight: 600 }}>
                        এখনো কোনো টেস্ট নেই
                      </span>
                    </p>
                    <Link className="cta-line" href="/exams">
                      নিজের টেস্ট বানাও →
                    </Link>
                    <p className="why">অধ্যায় বেছে নিলেই প্র্যাকটিস টেস্ট তৈরি হয়ে যাবে।</p>
                  </>
                )}
              </section>
            </div>
      </StudyDeskShell>
    </RoleGuard>
  );
}
