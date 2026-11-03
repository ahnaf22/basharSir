"use client";

import React, { useState, useEffect } from "react";
import { MathBanglaText } from "@/components/math-bangla/MathBanglaText";
import { toBanglaNumerals } from "@/components/math-bangla/bangla-numerals";
import { analyticsApi } from "../api/analytics.api";
import type { StudentAnalyticsDashboardResponse } from "../types/analytics.types";

interface StudentPerformanceDashboardProps {
  initialData: StudentAnalyticsDashboardResponse;
}

export function StudentPerformanceDashboard({
  initialData,
}: StudentPerformanceDashboardProps): React.JSX.Element {
  const [data, setData] = useState<StudentAnalyticsDashboardResponse>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        const res = await analyticsApi.getStudentAnalytics();
        if (isMounted && res?.student_id) {
          setData(res);
        }
      } catch {
        // Graceful fallback to initial data
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    snapshot,
    subject_matrix,
    topic_weaknesses,
    recommendations_bn,
    weekly_study_trend,
  } = data;

  const maxMinutes = Math.max(
    60,
    ...weekly_study_trend.map((d) => d.active_minutes)
  );

  return (
    <div className="space-y-6">
      {/* Tier 1: Executive Snapshot KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          data-testid="kpi-overall-mastery"
          className="rounded-2xl border border-desk-line bg-desk-paper p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-desk-muted">
            সার্বিক দক্ষতা (Overall Mastery)
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-desk-ink">
            {toBanglaNumerals(Math.round(snapshot.overall_mastery_pct))}%
          </p>
          <p className="mt-1 text-xs text-desk-muted">
            {toBanglaNumerals(snapshot.proficient_or_mastered_objectives)} /{" "}
            {toBanglaNumerals(snapshot.total_tracked_objectives)} শিখনফল অর্জিত
          </p>
        </div>

        <div
          data-testid="kpi-active-study-time"
          className="rounded-2xl border border-desk-line bg-desk-paper p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-desk-muted">
            সক্রিয় পাঠের সময় (৭ দিন)
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-desk-accent-ink">
            {toBanglaNumerals(snapshot.active_study_minutes_7d)} মিনিট
          </p>
          <p className="mt-1 text-xs text-desk-muted">
            সম্পন্ন টিউটর পাঠ:{" "}
            {toBanglaNumerals(snapshot.completed_tutor_sessions_7d)} টি
          </p>
        </div>

        <div
          data-testid="kpi-exams-taken"
          className="rounded-2xl border border-desk-line bg-desk-paper p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-desk-muted">
            পরীক্ষায় অংশগ্রহণ (৩০ দিন)
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-desk-ink">
            {toBanglaNumerals(snapshot.exams_taken_30d)} টি
          </p>
          <p className="mt-1 text-xs text-desk-muted">
            মূল্যায়নকৃত কুইজ ও মডেল টেস্ট
          </p>
        </div>

        <div
          data-testid="kpi-exam-avg"
          className="rounded-2xl border border-desk-line bg-desk-paper p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-desk-muted">
            পরীক্ষার গড় নম্বর
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-emerald-700">
            {toBanglaNumerals(Math.round(snapshot.average_exam_score_pct))}%
          </p>
          <p className="mt-1 text-xs text-desk-muted">
            রুব্রিক ও নৈর্ব্যক্তিক মূল্যায়নের ভিত্তিতে
          </p>
        </div>
      </div>

      {/* Tier 2 & Tier 5: Subject Performance Matrix + 7-Day Active Study Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm lg:col-span-7">
          <h2 className="font-heading text-lg font-bold text-desk-ink">
            বিষয়ভিত্তিক দক্ষতার ম্যাট্রিক্স (Subject Performance Matrix)
          </h2>
          <div className="mt-4 space-y-4">
            {subject_matrix.map((subj) => (
              <div
                key={subj.subject_id}
                data-testid={`subject-row-${subj.subject_id}`}
                className="rounded-xl border border-desk-line-soft bg-desk-paper-2 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-desk-text">
                      {subj.subject_name_bn}
                    </h3>
                    <p className="text-xs text-desk-muted">
                      অর্জিত শিখনফল: {toBanglaNumerals(subj.mastered_objectives)} /{" "}
                      {toBanglaNumerals(subj.tracked_objectives)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-desk-accent/10 px-2.5 py-1 text-xs font-bold text-desk-accent-ink">
                      {subj.status_bn} (
                      {toBanglaNumerals(Math.round(subj.average_mastery_pct))}%)
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-desk-track">
                  <div
                    className="h-full rounded-full bg-desk-accent"
                    style={{
                      width: `${Math.min(100, Math.round(subj.average_mastery_pct))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm lg:col-span-5">
          <h2 className="font-heading text-lg font-bold text-desk-ink">
            সাপ্তাহিক পড়াশোনার ধারাবাহিকতা (৭ দিন)
          </h2>
          <p className="mt-1 text-xs text-desk-muted">
            প্রতিদিনের সক্রিয় পড়াশোনার সময় (মিনিট)
          </p>
          <div className="mt-6 flex h-44 items-end justify-between gap-2 border-b border-desk-line pb-2">
            {weekly_study_trend.map((pt) => {
              const heightPct = Math.max(
                8,
                Math.round((pt.active_minutes / maxMinutes) * 100)
              );
              return (
                <div
                  key={pt.date}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-semibold text-desk-muted">
                    {toBanglaNumerals(pt.active_minutes)}মি.
                  </span>
                  <div
                    className="w-full max-w-[32px] rounded-t-lg bg-desk-ink transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs text-desk-muted">
                    {pt.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tier 3 & Tier 4: Topic Weakness Detector + Actionable Bangla Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm lg:col-span-6">
          <h2 className="font-heading text-lg font-bold text-desk-ink">
            অতিরিক্ত অনুশীলন প্রয়োজন এমন টপিক (Topic Weakness Detector)
          </h2>
          <div className="mt-4 space-y-3">
            {topic_weaknesses.length === 0 ? (
              <p className="text-sm text-emerald-700">
                চমৎকার! বর্তমানে কোনো টপিকে বড় ধরনের দুর্বলতা নেই।
              </p>
            ) : (
              topic_weaknesses.map((weak) => (
                <div
                  key={weak.learning_objective_id}
                  data-testid={`weak-topic-${weak.learning_objective_id}`}
                  className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-amber-800">
                        {weak.subject_name_bn} • {weak.chapter_name_bn}
                      </span>
                      <div className="mt-0.5 font-semibold text-desk-text">
                        <MathBanglaText content={weak.title_bn} />
                      </div>
                    </div>
                    <span className="rounded-lg bg-amber-200/70 px-2.5 py-1 text-xs font-bold text-amber-950">
                      দক্ষতা: {toBanglaNumerals(Math.round(weak.mastery_score))}%
                    </span>
                  </div>
                  {weak.misconception_tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {weak.misconception_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-desk-paper px-2 py-0.5 text-xs font-medium text-amber-900"
                        >
                          ভুল ধারণা: {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm lg:col-span-6">
          <h2 className="font-heading text-lg font-bold text-desk-ink">
            এআই টিউটরের পরামর্শ (Actionable Bangla Recommendations)
          </h2>
          <div className="mt-4 space-y-3">
            {recommendations_bn.map((rec, idx) => (
              <div
                key={`${rec.type}-${idx}`}
                data-testid={`recommendation-card-${idx}`}
                className="flex flex-col justify-between rounded-xl border border-desk-accent-line bg-desk-accent-soft p-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <span className="inline-block rounded bg-desk-accent px-2 py-0.5 text-xs font-bold uppercase text-white">
                    {rec.priority === "high" ? "জরুরি পদক্ষেপ" : "পরবর্তী পদক্ষেপ"}
                  </span>
                  <div className="font-semibold text-desk-text">
                    <MathBanglaText content={rec.title_bn} />
                  </div>
                  <div className="text-xs text-desk-text-2">
                    <MathBanglaText content={rec.description_bn} />
                  </div>
                </div>
                <a
                  href="/tutor"
                  className="mt-3 inline-flex shrink-0 items-center justify-center rounded-xl bg-desk-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-desk-ink-hover sm:mt-0"
                >
                  {rec.action_label_bn}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
