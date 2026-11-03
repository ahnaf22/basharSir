'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileText,
  PlayCircle,
  Download,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { StudyMaterialsReader } from '@/features/curriculum/components/StudyMaterialsReader';
import {
  fetchMySubjectsApi,
  fetchChapterResourcesApi,
  getResourcePdfDownloadUrl,
} from '@/features/curriculum/api/curriculum.api';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { cn } from '@/lib/utils';

export default function StudentMaterialsPage(): React.ReactElement {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  // Deep link from the dashboard (search / mastery): /materials?chapter_id=12
  const [linkedChapterId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = Number(new URLSearchParams(window.location.search).get('chapter_id'));
    return Number.isInteger(raw) && raw > 0 ? raw : null;
  });
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  // 1. Fetch Student Enrolled Subjects
  const {
    data: subjectsData,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: async () => {
      const res = await fetchMySubjectsApi();
      return res.data;
    },
    staleTime: 60_000,
  });

  const subjects = subjectsData?.subjects ?? [];
  const linkedSubject =
    selectedSubjectId === null && linkedChapterId !== null
      ? subjects.find((s) => s.chapters.some((c) => c.id === linkedChapterId))
      : undefined;
  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) ?? linkedSubject ?? subjects[0];

  const chapters = activeSubject?.chapters ?? [];
  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) ??
    (selectedSubjectId === null ? chapters.find((c) => c.id === linkedChapterId) : undefined) ??
    chapters[0];

  // 2. Fetch Resources for Active Chapter
  const {
    data: resourcesData,
    isLoading: isResourcesLoading,
  } = useQuery({
    queryKey: ['chapter-resources', activeChapter?.id],
    queryFn: async () => {
      if (!activeChapter?.id) return null;
      const res = await fetchChapterResourcesApi(activeChapter.id);
      return res.data;
    },
    enabled: Boolean(activeChapter?.id),
    staleTime: 60_000,
  });

  const resources = resourcesData?.resources ?? [];

  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title="পাঠ্যবই ও শিখন উপকরণ"
        subtitle={
          subjectsData
            ? `${toBanglaNumerals(subjectsData.grade_level)}ম শ্রেণির জাতীয় শিক্ষাক্রম (NCTB ২০২৬) অনুমোদিত পাঠ্যক্রম`
            : 'পাঠ্যবইয়ের অধ্যায়, শিখনফল ও নোটস'
        }
      >
        {isSubjectsLoading ? (
          <div className="space-y-6">
            <CardSkeleton />
            <ListSkeleton count={4} />
          </div>
        ) : isSubjectsError ? (
          <div className="rounded-xl border border-status-danger/30 bg-status-danger/10 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-status-danger mb-2" />
            <h2 className="font-heading font-semibold text-status-danger">
              পাঠ্যক্রম তথ্য লোড করা যায়নি
            </h2>
            <p className="mt-1 font-bangla text-xs text-content-secondary">
              {(subjectsError as Error)?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।'}
            </p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => refetchSubjects()}>
              <RefreshCw className="h-3.5 w-3.5" />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            title="কোনো বিষয় পাওয়া যায়নি"
            description="আপনার শ্রেণির জন্য পাঠ্যক্রম এখনও নিবন্ধিত হয়নি।"
          />
        ) : (
          <div className="space-y-6">
            {/* Subject Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
              {subjects.map((subj) => {
                const isSelected = (activeSubject?.id ?? 0) === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(subj.id);
                      setSelectedChapterId(subj.chapters[0]?.id ?? null);
                    }}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-heading text-xs font-semibold transition-all',
                      isSelected
                        ? 'border-brand-primary bg-brand-primary text-white shadow-xs'
                        : 'border-border-subtle bg-surface text-content-primary hover:bg-subtle'
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{subj.title_bn}</span>
                    <span className="font-mono text-xs opacity-80">
                      ({subj.subject_code})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Chapters & Reader Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Chapters & Objectives Accordion (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-sm font-bold text-content-primary">
                    অধ্যায় তালিকা ({toBanglaNumerals(chapters.length)}টি)
                  </h2>
                </div>

                <div className="space-y-3">
                  {chapters.map((ch) => {
                    const isChapterActive = (activeChapter?.id ?? 0) === ch.id;

                    return (
                      <div
                        key={ch.id}
                        className={cn(
                          'rounded-xl border transition-all duration-200 overflow-hidden',
                          isChapterActive
                            ? 'border-brand-secondary bg-surface shadow-xs ring-1 ring-brand-secondary/30'
                            : 'border-border-subtle bg-surface/80 hover:border-brand-primary/30'
                        )}
                      >
                        {/* Chapter Header */}
                        <div
                          onClick={() => setSelectedChapterId(ch.id)}
                          className="cursor-pointer p-4 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-brand-secondary">
                                অধ্যায় {toBanglaNumerals(ch.chapter_number)}
                              </span>
                              <Badge variant="neutral">
                                {toBanglaNumerals(ch.objectives_count)}টি শিখনফল
                              </Badge>
                            </div>

                            <h3 className="font-heading text-sm font-bold text-content-primary">
                              {ch.title_bn}
                            </h3>
                          </div>

                          <ChevronRight
                            className={cn(
                              'h-5 w-5 text-content-secondary transition-transform',
                              isChapterActive && 'rotate-90 text-brand-secondary'
                            )}
                          />
                        </div>

                        {/* Objectives List when chapter is selected */}
                        {isChapterActive && (
                          <div className="border-t border-border-subtle/80 bg-subtle/30 p-3 space-y-2">
                            <span className="font-heading text-xs font-semibold text-content-secondary uppercase">
                              শিখনফল ও এআই টিউটর পাঠ:
                            </span>

                            {ch.topics.map((tp) => (
                              <div key={tp.id} className="space-y-1.5">
                                {tp.learning_objectives.map((obj) => (
                                  <div
                                    key={obj.id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle/60 bg-surface p-2.5 text-xs"
                                  >
                                    <div className="flex-1 space-y-0.5">
                                      <span className="font-mono text-xs text-content-secondary">
                                        {obj.code}
                                      </span>
                                      <p className="font-bangla font-medium text-content-primary leading-tight">
                                        {obj.title_bn}
                                      </p>
                                    </div>

                                    <Link href={`/tutor?objective_id=${obj.id}`}>
                                      <Button size="sm" variant="primary" className="h-7 text-xs gap-1 shrink-0">
                                        <Sparkles className="h-3 w-3" />
                                        <span>পাঠ শুরু</span>
                                      </Button>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chapter Resources Reader (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {activeChapter ? (
                  <div className="space-y-4">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4">
                      <div>
                        <span className="font-mono text-xs text-brand-secondary font-semibold">
                          অধ্যায় {toBanglaNumerals(activeChapter.chapter_number)}
                        </span>
                        <h2 className="font-heading text-base font-bold text-content-primary">
                          {activeChapter.title_bn}
                        </h2>
                      </div>

                      {/* PDF Download Gated Feature */}
                      <FeatureGate
                        featureKey="materials.pdf_download"
                        fallback={
                          <Link href="/parent/billing">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                              <Download className="h-3.5 w-3.5 text-accent-warm" />
                              <span>PDF আনলক (প্রিমিয়াম)</span>
                            </Button>
                          </Link>
                        }
                      >
                        {resources[0] && (
                          <a
                            href={getResourcePdfDownloadUrl(resources[0].id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                              <Download className="h-3.5 w-3.5" />
                              <span>নোটের PDF ডাউনলোড</span>
                            </Button>
                          </a>
                        )}
                      </FeatureGate>
                    </div>

                    {/* Resources Reader */}
                    {isResourcesLoading ? (
                      <CardSkeleton />
                    ) : resources.length > 0 ? (
                      <StudyMaterialsReader
                        chapterTitleBn={activeChapter.title_bn}
                        chapterNumber={activeChapter.chapter_number}
                        resources={resources}
                      />
                    ) : (
                      <EmptyState
                        icon={<FileText className="h-6 w-6" />}
                        title="এই অধ্যায়ের পাঠ নোট প্রস্তুত করা হচ্ছে"
                        description="এনসিটিবি অনুমোদিত পাঠ্যবই অনুসারে নোট ও সূত্র তালিকা খুব শীঘ্রই প্রকাশিত হবে।"
                      />
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={<BookOpen className="h-6 w-6" />}
                    title="অধ্যায় নির্বাচন করুন"
                    description="বাম পাশের তালিকা থেকে একটি অধ্যায় নির্বাচন করুন।"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </RoleGuard>
  );
}
