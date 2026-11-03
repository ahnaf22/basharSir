'use client';

import React, { useState, useEffect } from 'react';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { studyPlannerApi } from '../api/study-planner.api';
import { useActiveStudyHeartbeat } from '../hooks/useActiveStudyHeartbeat';
import type {
  StudyPlanData,
  StudyPlanItemData,
  StudyTaskType,
} from '../types/study-planner.types';

const AVAILABLE_NCTB_CHAPTERS: ReadonlyArray<{
  id: number;
  subjectBn: string;
  chapterNumber: number;
  titleBn: string;
  estimatedMins: number;
}> = [
  {
    id: 1,
    subjectBn: 'গণিত (অষ্টম শ্রেণি)',
    chapterNumber: 4,
    titleBn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
    estimatedMins: 180,
  },
  {
    id: 2,
    subjectBn: 'গণিত (অষ্টম শ্রেণি)',
    chapterNumber: 6,
    titleBn: 'সরল সহসমীকরণ',
    estimatedMins: 150,
  },
  {
    id: 3,
    subjectBn: 'বিজ্ঞান (অষ্টম শ্রেণি)',
    chapterNumber: 7,
    titleBn: 'পৃথিবী ও মহাকর্ষ',
    estimatedMins: 120,
  },
];

const INITIAL_DEMO_PLAN: StudyPlanData = {
  id: 301,
  student_id: 1,
  curriculum_version_id: 1,
  title: 'অষ্টম শ্রেণি গণিত ও বিজ্ঞান বার্ষিক প্রস্তুতি রুটিন',
  target_completion_date: '2026-11-20',
  daily_study_minutes: 60,
  status: 'active',
  completion_percentage: 25,
  config_json: {
    selected_chapter_ids: [1, 2],
    coach_message_bn:
      'তোমার নির্বাচিত অধ্যায় ও পূর্বজ্ঞান বিশ্লেষণ করে প্রতিদিনের রুটিন সাজানো হয়েছে। দুর্বল টপিকগুলোতে অতিরিক্ত অনুশীলনের সময় রাখা হয়েছে।',
  },
  items: [
    {
      id: 901,
      study_plan_id: 301,
      task_type: 'prerequisite_remedial',
      title_bn: 'পূর্বজ্ঞান পুনরালোচনা: চলক ও সদৃশ পদের যোগ-বিয়োগ',
      scheduled_date: '2026-11-01',
      planned_minutes: 25,
      actual_active_minutes: 25,
      status: 'completed',
      rescheduled_from_date: null,
      completed_at: '2026-11-01T10:30:00Z',
    },
    {
      id: 902,
      study_plan_id: 301,
      task_type: 'concept_lesson',
      title_bn: 'পাঠ ও অনুশীলন: দ্বিপদী ও ত্রিপদী রাশির বর্গ নির্ণয়',
      scheduled_date: '2026-11-01',
      planned_minutes: 30,
      actual_active_minutes: 0,
      status: 'scheduled',
      rescheduled_from_date: null,
    },
    {
      id: 903,
      study_plan_id: 301,
      task_type: 'guided_practice',
      title_bn: 'অতিরিক্ত অনুশীলন: মান নির্ণয়ে বর্গের অনুসিদ্ধান্তের প্রয়োগ',
      scheduled_date: '2026-11-02',
      planned_minutes: 25,
      actual_active_minutes: 0,
      status: 'scheduled',
      rescheduled_from_date: null,
    },
    {
      id: 904,
      study_plan_id: 301,
      task_type: 'chapter_quiz',
      title_bn: 'অধ্যায়ভিত্তিক মূল্যায়ন কুইজ: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
      scheduled_date: '2026-11-03',
      planned_minutes: 30,
      actual_active_minutes: 0,
      status: 'scheduled',
      rescheduled_from_date: null,
    },
  ],
};

const TASK_TYPE_BADGE: Record<
  StudyTaskType,
  { labelBn: string; variant: 'teal' | 'warning' | 'navy' | 'success' | 'neutral' }
> = {
  prerequisite_remedial: { labelBn: 'পূর্বজ্ঞান প্রতিকার', variant: 'warning' },
  concept_lesson: { labelBn: 'মূল পাঠ', variant: 'teal' },
  concept_review: { labelBn: 'পাঠ পর্যালোচনা', variant: 'teal' },
  guided_practice: { labelBn: 'নির্দেশিত অনুশীলন', variant: 'navy' },
  revision: { labelBn: 'পুনরালোচনা', variant: 'neutral' },
  chapter_quiz: { labelBn: 'অধ্যায় কুইজ', variant: 'success' },
};

type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export function StudyPlannerAndCalendarWorkspace(): React.ReactElement {
  const [plan, setPlan] = useState<StudyPlanData>(INITIAL_DEMO_PLAN);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2]);
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [targetDate, setTargetDate] = useState<string>('2026-11-20');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [bannerMessageBn, setBannerMessageBn] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadActivePlan() {
      try {
        const active = await studyPlannerApi.getActivePlan();
        if (isMounted && active?.id) {
          setPlan(active);
        }
      } catch {
        // Keeps initial fallback gracefully
      }
    }
    loadActivePlan();
    return () => {
      isMounted = false;
    };
  }, []);

  const heartbeat = useActiveStudyHeartbeat({
    sourceType: 'resource_study',
    sourceId: plan.id,
    enabled: true,
  });

  const toggleChapter = (chapterId: number): void => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleGeneratePlan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (selectedChapters.length === 0 || isBusy) {
      return;
    }

    setIsBusy(true);
    setBannerMessageBn(null);

    try {
      const created = await studyPlannerApi.createPlan({
        title: 'অষ্টম শ্রেণি ব্যক্তিগতকৃত স্টাডি প্ল্যান',
        chapter_ids: selectedChapters,
        target_completion_date: targetDate,
        daily_study_minutes: dailyMinutes,
      });
      setPlan(created);
      setBannerMessageBn('নতুন ব্যক্তিগতকৃত স্টাডি প্ল্যান সফলভাবে তৈরি হয়েছে!');
    } catch {
      const generatedItems: StudyPlanItemData[] = selectedChapters.flatMap((chId, idx) => {
        const ch = AVAILABLE_NCTB_CHAPTERS.find((c) => c.id === chId);
        const chapterTitle = ch?.titleBn ?? `অধ্যায় ${chId}`;
        return [
          {
            id: 1000 + idx * 2,
            study_plan_id: plan.id + 1,
            task_type: 'concept_lesson',
            title_bn: `পাঠ ও অনুশীলন: ${chapterTitle}`,
            scheduled_date: `2026-11-0${Math.min(9, idx + 1)}`,
            planned_minutes: 30,
            actual_active_minutes: 0,
            status: 'scheduled',
            rescheduled_from_date: null,
          },
          {
            id: 1001 + idx * 2,
            study_plan_id: plan.id + 1,
            task_type: 'chapter_quiz',
            title_bn: `অধ্যায়ভিত্তিক মূল্যায়ন কুইজ: ${chapterTitle}`,
            scheduled_date: `2026-11-0${Math.min(9, idx + 2)}`,
            planned_minutes: 30,
            actual_active_minutes: 0,
            status: 'scheduled',
            rescheduled_from_date: null,
          },
        ];
      });

      setPlan((prev) => ({
        ...prev,
        daily_study_minutes: dailyMinutes,
        target_completion_date: targetDate,
        completion_percentage: 0,
        items: generatedItems,
      }));
      setBannerMessageBn('নতুন ব্যক্তিগতকৃত স্টাডি প্ল্যান সফলভাবে তৈরি হয়েছে!');
    } finally {
      setIsBusy(false);
    }
  };

  const handleMarkComplete = async (item: StudyPlanItemData): Promise<void> => {
    setIsBusy(true);
    try {
      await studyPlannerApi.rescheduleItem({
        itemId: item.id,
        status: 'completed',
        actual_active_minutes: item.planned_minutes,
      });
    } catch {
      // Offline fallback
    } finally {
      setPlan((prev) => {
        const nextItems = prev.items.map((it) =>
          it.id === item.id
            ? {
                ...it,
                status: 'completed' as const,
                actual_active_minutes: it.planned_minutes,
              }
            : it
        );
        const completedCount = nextItems.filter((it) => it.status === 'completed').length;
        const pct = Math.round((completedCount / Math.max(1, nextItems.length)) * 100);
        return {
          ...prev,
          completion_percentage: pct,
          items: nextItems,
        };
      });
      setIsBusy(false);
    }
  };

  const handleRescheduleItem = async (
    item: StudyPlanItemData,
    nextDateString: string
  ): Promise<void> => {
    setIsBusy(true);
    try {
      await studyPlannerApi.rescheduleItem({
        itemId: item.id,
        scheduled_date: nextDateString,
      });
    } catch {
      // Offline fallback
    } finally {
      setPlan((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === item.id
            ? {
                ...it,
                rescheduled_from_date: it.scheduled_date,
                scheduled_date: nextDateString,
                status: 'rescheduled',
              }
            : it
        ),
      }));
      setBannerMessageBn('পাঠটি নতুন তারিখে পুনঃনির্ধারণ (Reschedule) করা হয়েছে।');
      setIsBusy(false);
    }
  };

  const handleRebalance = async (): Promise<void> => {
    setIsBusy(true);
    try {
      const updated = await studyPlannerApi.rebalancePlan(plan.id);
      setPlan(updated);
    } catch {
      setPlan((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.status === 'overdue'
            ? { ...it, status: 'rescheduled', scheduled_date: '2026-11-04' }
            : it
        ),
      }));
    } finally {
      setBannerMessageBn(
        'অসম্পূর্ণ ও দুর্বল টপিকগুলো বিশ্লেষণ করে রুটিন স্বয়ংক্রিয়ভাবে সমন্বয় করা হয়েছে।'
      );
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Active Study Heartbeat & Coach Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-desk-line bg-desk-paper p-5 shadow-sm">
        <div>
          <span className="font-bangla text-xs font-semibold text-desk-accent-ink">
            ব্যক্তিগতকৃত অধ্যয়ন পরিকল্পনাকারী (Study Planner & Calendar)
          </span>
          <h2 className="font-bangla text-xl font-bold text-desk-ink">{plan.title}</h2>
          <p className="mt-1 font-bangla text-sm text-desk-muted">
            {plan.config_json.coach_message_bn}
          </p>
        </div>

        {/* Active Study Heartbeat Live Meter */}
        <div
          data-testid="active-heartbeat-widget"
          className="flex items-center gap-3 rounded-lg border border-desk-accent-line bg-desk-accent-soft px-4 py-2.5"
        >
          <div>
            <span className="block font-bangla text-xs text-desk-muted">
              যাচাইকৃত সক্রিয় অধ্যয়ন সময় (৩০ সেকেন্ড হার্টবিট)
            </span>
            <span className="font-bangla text-sm font-bold text-desk-ink">
              সক্রিয়: {toBanglaNumerals(heartbeat.activeSeconds)} সেকেন্ড | বিরতি:{' '}
              {toBanglaNumerals(heartbeat.pausedSeconds)} সেকেন্ড
            </span>
          </div>
          <button
            type="button"
            data-testid="manual-heartbeat-ping-btn"
            onClick={() => void heartbeat.triggerManualPing(false)}
            className="rounded border border-desk-accent-line bg-desk-paper px-2.5 py-1 font-bangla text-xs font-semibold text-desk-accent-ink hover:bg-desk-accent-soft-hover"
          >
            হার্টবিট পিং
          </button>
        </div>
      </div>

      {bannerMessageBn && (
        <div
          role="status"
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-bangla text-sm font-medium text-emerald-950"
        >
          {bannerMessageBn}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Study Plan Creation Wizard */}
        <section
          aria-label="স্টাডি প্ল্যান তৈরির উইজার্ড"
          className="rounded-xl border border-desk-line bg-desk-paper p-5 shadow-sm lg:col-span-4"
        >
          <h2 className="font-bangla text-base font-bold text-desk-ink">
            নতুন অধ্যয়ন পরিকল্পনা তৈরি করো
          </h2>
          <p className="mt-1 font-bangla text-xs text-desk-muted">
            তোমার অধ্যায় ও প্রতিদিনের সময় নির্বাচন করলে এআই গৃহশিক্ষক পূর্বজ্ঞান যাচাইসহ রুটিন তৈরি করবে।
          </p>

          <form onSubmit={(e) => void handleGeneratePlan(e)} className="mt-4 space-y-4">
            <div>
              <span className="block font-bangla text-xs font-semibold text-desk-text-2">
                এনসিটিবি অধ্যায় নির্বাচন করো:
              </span>
              <div className="mt-2 space-y-2">
                {AVAILABLE_NCTB_CHAPTERS.map((ch) => {
                  const isChecked = selectedChapters.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs ${
                        isChecked
                          ? 'border-desk-accent-line bg-desk-accent-soft'
                          : 'border-desk-line bg-desk-paper'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChapter(ch.id)}
                        className="mt-0.5 rounded border-desk-line-strong text-desk-accent-ink"
                      />
                      <div>
                        <span className="block font-bangla font-semibold text-desk-text">
                          অধ্যায় {toBanglaNumerals(ch.chapterNumber)}: {ch.titleBn}
                        </span>
                        <span className="font-bangla text-xs text-desk-muted">
                          {ch.subjectBn} • আনুমানিক {toBanglaNumerals(ch.estimatedMins)} মিনিট
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="daily-minutes-select"
                className="block font-bangla text-xs font-semibold text-desk-text-2"
              >
                প্রতিদিনের অধ্যয়ন লক্ষ্যমাত্রা (মিনিট):
              </label>
              <select
                id="daily-minutes-select"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-desk-line-strong px-3 py-2 font-bangla text-sm text-desk-text"
              >
                <option value={30}>৩০ মিনিট / দিন</option>
                <option value={60}>৬০ মিনিট / দিন (প্রস্তাবিত)</option>
                <option value={90}>৯০ মিনিট / দিন</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="target-date-input"
                className="block font-bangla text-xs font-semibold text-desk-text-2"
              >
                লক্ষ্যমাত্রার তারিখ (পরীক্ষার আগে):
              </label>
              <input
                id="target-date-input"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-desk-line-strong px-3 py-2 text-sm text-desk-text"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isBusy || selectedChapters.length === 0}
              className="w-full"
            >
              রুটিন তৈরি করো
            </Button>
          </form>
        </section>

        {/* Right Column: Daily / Weekly / Monthly Learning Calendar & Task Rescheduler */}
        <section
          aria-label="লার্নিং ক্যালেন্ডার ও রুটিন তালিকা"
          className="rounded-xl border border-desk-line bg-desk-paper p-5 shadow-sm lg:col-span-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-desk-line-soft pb-4">
            <div>
              <h2 className="font-bangla text-base font-bold text-desk-ink">
                লার্নিং ক্যালেন্ডার ও প্রতিদিনের পাঠ তালিকা
              </h2>
              <p className="font-bangla text-xs text-desk-muted">
                সম্পন্ন অগ্রগতি:{' '}
                <strong data-testid="plan-completion-pct">
                  {toBanglaNumerals(Math.round(plan.completion_percentage))}%
                </strong>{' '}
                • দৈনিক লক্ষ্য: {toBanglaNumerals(plan.daily_study_minutes)} মিনিট
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  data-testid={`calendar-view-${mode}`}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg px-3 py-1.5 font-bangla text-xs font-semibold ${
                    viewMode === mode
                      ? 'bg-desk-ink text-white'
                      : 'border border-desk-line bg-desk-paper-2 text-desk-text-2'
                  }`}
                >
                  {mode === 'daily' ? 'দৈনিক' : mode === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'}
                </button>
              ))}

              <button
                type="button"
                data-testid="auto-rebalance-btn"
                onClick={() => void handleRebalance()}
                disabled={isBusy}
                className="rounded-lg border border-desk-accent-line bg-desk-accent-soft px-3 py-1.5 font-bangla text-xs font-semibold text-desk-accent-ink hover:bg-desk-accent-soft-hover"
              >
                স্বয়ংক্রিয় রুটিন সমন্বয়
              </button>
            </div>
          </div>

          <div
            data-testid="calendar-active-mode-indicator"
            className="mt-3 font-bangla text-xs font-medium text-desk-muted"
          >
            সক্রিয় ভিউ: {viewMode === 'daily' ? 'দৈনিক' : viewMode === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'} ক্যালেন্ডার
          </div>

          <ul className="mt-4 space-y-3">
            {plan.items.map((item) => {
              const badgeInfo = TASK_TYPE_BADGE[item.task_type] ?? { labelBn: 'পাঠ', variant: 'neutral' as const };
              const isCompleted = item.status === 'completed';

              return (
                <li
                  key={item.id}
                  data-testid={`study-plan-item-${item.id}`}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : item.status === 'rescheduled'
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-desk-line bg-desk-paper'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badgeInfo.variant}>{badgeInfo.labelBn}</Badge>
                      <span className="font-mono text-xs font-medium text-desk-muted">
                        {item.scheduled_date}
                      </span>
                      {item.rescheduled_from_date && (
                        <span className="font-bangla text-xs font-medium text-amber-800">
                          (পূর্বের তারিখ: {item.rescheduled_from_date})
                        </span>
                      )}
                    </div>
                    <h3 className="font-bangla text-sm font-bold text-desk-text">
                      {item.title_bn}
                    </h3>
                    <p className="font-bangla text-xs text-desk-muted">
                      নির্ধারিত সময়: {toBanglaNumerals(item.planned_minutes)} মিনিট • অবস্থা:{' '}
                      <strong>
                        {isCompleted
                          ? 'সম্পন্ন ✓'
                          : item.status === 'rescheduled'
                            ? 'পুনঃনির্ধারিত'
                            : 'নির্ধারিত'}
                      </strong>
                    </p>
                  </div>

                  {!isCompleted && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        data-testid={`reschedule-item-${item.id}`}
                        onClick={() => void handleRescheduleItem(item, '2026-11-05')}
                        disabled={isBusy}
                        className="rounded-lg border border-desk-line-strong bg-desk-paper px-3 py-1.5 font-bangla text-xs font-medium text-desk-text-2 hover:bg-desk-paper-2"
                      >
                        তারিখ পরিবর্তন
                      </button>
                      <button
                        type="button"
                        data-testid={`complete-item-${item.id}`}
                        onClick={() => void handleMarkComplete(item)}
                        disabled={isBusy}
                        className="rounded-lg bg-desk-accent px-3 py-1.5 font-bangla text-xs font-semibold text-white hover:bg-desk-accent-hover"
                      >
                        সম্পন্ন করো
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

