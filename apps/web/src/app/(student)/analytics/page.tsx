import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { StudentPerformanceDashboard } from "@/features/analytics/components/StudentPerformanceDashboard";
import type { StudentAnalyticsDashboardResponse } from "@/features/analytics/types/analytics.types";

const initialAnalyticsData: StudentAnalyticsDashboardResponse = {
  student_id: 1,
  student_code: "STU-2026-0001",
  snapshot: {
    overall_mastery_pct: 68.5,
    proficient_or_mastered_objectives: 4,
    total_tracked_objectives: 6,
    active_study_minutes_7d: 145,
    completed_tutor_sessions_7d: 5,
    exams_taken_30d: 3,
    average_exam_score_pct: 82.0,
  },
  subject_matrix: [
    {
      subject_id: 1,
      subject_name_bn: "গণিত (Mathematics)",
      subject_name_en: "Mathematics",
      tracked_objectives: 4,
      mastered_objectives: 3,
      average_mastery_pct: 74.0,
      status_bn: "দক্ষ (Proficient)",
    },
    {
      subject_id: 2,
      subject_name_bn: "বিজ্ঞান (Science)",
      subject_name_en: "Science",
      tracked_objectives: 2,
      mastered_objectives: 1,
      average_mastery_pct: 58.0,
      status_bn: "অগ্রসরমাণ (Developing)",
    },
  ],
  topic_weaknesses: [
    {
      learning_objective_id: 202,
      code: "NCTB-2026-C8-MATH-CH5-LO2",
      title_bn: "বাস্তব সমস্যার সমীকরণ গঠন ও সমাধান",
      chapter_name_bn: "পঞ্চম অধ্যায়: সরল সমীকরণ",
      subject_name_bn: "গণিত",
      mastery_score: 42.0,
      mastery_level: "developing",
      misconception_tags: ["sign_reversal_error", "exponent_addition_error"],
    },
  ],
  recommendations_bn: [
    {
      type: "remedial_lesson",
      priority: "high",
      learning_objective_id: 202,
      title_bn: "পুনরায় অনুশীলন প্রয়োজন: বাস্তব সমস্যার সমীকরণ গঠন ও সমাধান",
      description_bn:
        "‘পঞ্চম অধ্যায়: সরল সমীকরণ’ এর এই শিখনফলে তোমার বর্তমান দক্ষতা ৪২%। এআই টিউটরের সাথে ধাপে ধাপে অনুশীলন করে দক্ষতা বাড়িয়ে নাও।",
      action_label_bn: "এআই টিউটরের সাথে অনুশীলন করো",
    },
  ],
  weekly_study_trend: [
    { date: "2026-10-26", active_minutes: 20 },
    { date: "2026-10-27", active_minutes: 25 },
    { date: "2026-10-28", active_minutes: 15 },
    { date: "2026-10-29", active_minutes: 30 },
    { date: "2026-10-30", active_minutes: 20 },
    { date: "2026-10-31", active_minutes: 15 },
    { date: "2026-11-01", active_minutes: 20 },
  ],
};

export default function StudentAnalyticsPage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title="ফলাফল ও শিখন অগ্রগতি বিশ্লেষণ"
        subtitle="এনসিটিবি পাঠ্যক্রমের শিখনফলভিত্তিক পারদর্শিতা ও সক্রিয় পাঠের সময়ের রিয়েল-টাইম চার্ট"
      >
        <StudentPerformanceDashboard initialData={initialAnalyticsData} />
      </AppShell>
    </RoleGuard>
  );
}

