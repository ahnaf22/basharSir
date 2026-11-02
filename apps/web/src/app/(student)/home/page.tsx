'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Award,
  Clock,
  CheckCircle,
  PlayCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { Stat } from '@/components/ui/Stat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { fetchStudentDashboardApi } from '@/features/dashboard/api/student-dashboard.api';

export default function StudentHomePage(): React.ReactElement {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await fetchStudentDashboardApi();
      return res.data;
    },
    staleTime: 30_000,
  });

  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title={
          data?.student?.name_bn
            ? `স্বাগতম, ${data.student.name_bn}!`
            : 'শিক্ষার্থী ড্যাশবোর্ড'
        }
        subtitle={
          data?.student
            ? `শ্রেণি: ${toBanglaNumerals(data.student.current_class_level)}ম | আইডি: ${data.student.student_code}`
            : 'আপনার দৈনিক পড়াশোনা ও শিখন অগ্রগতির সামগ্রিক চিত্র'
        }
      >
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-status-danger/30 bg-status-danger/10 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-status-danger mb-2" />
            <h3 className="font-heading font-semibold text-status-danger">
              ড্যাশবোর্ড তথ্য লোড করা যায়নি
            </h3>
            <p className="mt-1 font-bangla text-xs text-content-secondary">
              {(error as Error)?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।'}
            </p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* 1. Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat
                title="ধারাবাহিক স্ট্রিক"
                value={`${toBanglaNumerals(data.streak.current_days)} দিন`}
                subtitle={`ফ্রিজ অবশিষ্ট: ${toBanglaNumerals(data.streak.freezes_available)}টি`}
                icon={<Flame className="h-5 w-5 text-amber-500" />}
                accent="amber"
              />

              <Stat
                title="মোট অর্জিত এক্সপি"
                value={`${toBanglaNumerals(data.gamification.total_xp)} XP`}
                subtitle={`মোট ব্যাজ: ${toBanglaNumerals(data.gamification.badges_count)}টি`}
                icon={<Award className="h-5 w-5 text-brand-secondary" />}
                accent="teal"
              />

              <Stat
                title="আজকের পড়ার সময়"
                value={`${toBanglaNumerals(data.today_study_time.active_minutes)} মি.`}
                subtitle={`দৈনিক লক্ষ্যমাত্রা: ${toBanglaNumerals(data.today_study_time.target_minutes)} মিনিট`}
                icon={<Clock className="h-5 w-5 text-brand-primary" />}
                accent="navy"
              />

              <Stat
                title="আজকের পড়ার কাজ"
                value={`${toBanglaNumerals(data.today_tasks.length)} টি`}
                subtitle="রুটিন অনুযায়ী নির্ধারিত"
                icon={<CheckCircle className="h-5 w-5 text-teal-600" />}
                accent="teal"
              />
            </div>

            {/* 2. Hero: Continue Lesson */}
            {data.continue_lesson ? (
              <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 via-surface to-brand-secondary/5 p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="teal">{data.continue_lesson.subject_title_bn}</Badge>
                      <Badge variant="neutral">{data.continue_lesson.chapter_title_bn}</Badge>
                      <Badge variant="amber">চলমান পাঠ</Badge>
                    </div>

                    <h2 className="font-heading text-lg font-bold text-brand-primary sm:text-xl">
                      {data.continue_lesson.title_bn}
                    </h2>

                    <p className="font-bangla text-xs text-content-secondary">
                      বর্তমান ধাপ: <span className="font-semibold text-content-primary">{data.continue_lesson.current_stage}</span>
                    </p>
                  </div>

                  <Link href={`/tutor?session_id=${data.continue_lesson.session_id}`}>
                    <Button variant="primary" size="lg" className="whitespace-nowrap shadow-sm">
                      <PlayCircle className="h-5 w-5" />
                      পাঠ চালিয়ে যান
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="কোনো পাঠ এই মুহূর্তে চলমান নেই"
                description="পাঠ্যবইয়ের অধ্যায় নির্বাচন করে আপনার ব্যক্তিগত এআই গৃহশিক্ষকের সাথে ধাপে ধাপে পড়া শুরু করুন।"
                actionLabel="নতুন পাঠ শুরু করুন →"
                actionHref="/materials"
              />
            )}

            {/* 3. Two Column Layout: Today's Tasks & Subject Mastery */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Today's Tasks */}
              <Card elevated>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>আজকের পড়ার তালিকা</CardTitle>
                    <CardDescription>
                      অ্যাডাপ্টিভ স্টাডি প্ল্যান অনুযায়ী আজকের জন্য নির্ধারিত বিষয় ও সময়
                    </CardDescription>
                  </div>
                  <Link href="/planner" className="font-heading text-xs font-semibold text-brand-secondary hover:underline">
                    সম্পূর্ণ রুটিন →
                  </Link>
                </CardHeader>

                <CardContent>
                  {data.today_tasks.length === 0 ? (
                    <EmptyState
                      icon={<Calendar className="h-5 w-5" />}
                      title="আজকের কোনো কাজ বাকি নেই"
                      description="দারুণ! আপনি আজকের সব নির্ধারিত বিষয় সম্পন্ন করেছেন অথবা নতুন প্ল্যান তৈরি করুন।"
                      actionLabel="নতুন স্টাডি প্ল্যান তৈরি করুন"
                      actionHref="/planner"
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.today_tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between rounded-xl border border-border-subtle bg-canvas/60 p-3.5 transition-colors hover:border-brand-secondary/40"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="teal">{task.subject_title_bn}</Badge>
                              <span className="font-mono text-xs text-content-secondary">
                                {toBanglaNumerals(task.estimated_minutes)} মিনিট
                              </span>
                            </div>
                            <p className="font-heading text-sm font-semibold text-content-primary">
                              {task.title_bn}
                            </p>
                          </div>

                          <Link href={`/tutor?objective_id=${task.learning_objective_id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <span>অনুশীলন</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Subject Mastery */}
              <Card elevated>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>বিষয়ভিত্তিক NCTB দক্ষতা</CardTitle>
                    <CardDescription>
                      যাচাইকৃত মূল্যায়নের ভিত্তিতে নির্ণীত গণিত ও বিজ্ঞান পারদর্শিতা
                    </CardDescription>
                  </div>
                  <Link href="/analytics" className="font-heading text-xs font-semibold text-brand-secondary hover:underline">
                    বিস্তারিত বিশ্লেষণ →
                  </Link>
                </CardHeader>

                <CardContent>
                  {data.subject_mastery.length === 0 ? (
                    <EmptyState
                      icon={<BookOpen className="h-5 w-5" />}
                      title="দক্ষতা রেকর্ড এখনও পাওয়া যায়নি"
                      description="অধ্যায়ভিত্তিক কুইজ ও অনুশীলন সম্পন্ন করলে এখানে আপনার বিষয়ভিত্তিক দক্ষতা প্রদর্শিত হবে।"
                    />
                  ) : (
                    <div className="space-y-4">
                      {data.subject_mastery.map((subj) => (
                        <div key={subj.id} className="rounded-xl border border-border-subtle bg-canvas/60 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-sm font-bold text-content-primary">
                                {subj.title_bn}
                              </span>
                              <span className="font-mono text-xs text-content-secondary">
                                ({subj.title_en})
                              </span>
                            </div>

                            <span className="font-mono text-xs font-bold text-brand-primary">
                              {toBanglaNumerals(subj.mastery_pct)}% দক্ষতা
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-subtle">
                            <div
                              className="h-full rounded-full bg-brand-primary transition-all duration-500"
                              style={{ width: `${Math.min(100, subj.mastery_pct)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-content-secondary">
                            <span>
                              অর্জিত শিখনফল: {toBanglaNumerals(subj.mastered_objectives)} / {toBanglaNumerals(subj.total_objectives)}
                            </span>
                            <Link
                              href={`/materials?subject_id=${subj.id}`}
                              className="font-medium text-brand-secondary hover:underline"
                            >
                              অধ্যায়সমূহ দেখুন →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 4. Badges & Gamification Showcase */}
            {data.gamification.badges.length > 0 && (
              <Card elevated>
                <CardHeader>
                  <CardTitle>অর্জিত সম্মাননা ও ব্যাজ</CardTitle>
                  <CardDescription>
                    ধারাবাহিক পড়াশোনা ও মূল্যায়নে কৃতিত্বের স্মারক
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {data.gamification.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-50/40 p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold">
                          🏅
                        </div>
                        <div>
                          <p className="font-heading text-xs font-bold text-content-primary">
                            {badge.title_bn}
                          </p>
                          <p className="font-mono text-[10px] text-content-secondary">
                            কোড: {badge.badge_code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </AppShell>
    </RoleGuard>
  );
}

