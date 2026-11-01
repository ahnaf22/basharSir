import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GuardianParentPortalDashboard } from "@/features/parent-portal/components/GuardianParentPortalDashboard";
import type { GuardianWeeklyChildReportResponse } from "@/features/analytics/types/analytics.types";

const childrenList = [
  {
    student_code: "STU-2026-0001",
    full_name_bn: "রাফি আহমেদ",
    class_label_bn: "অষ্টম শ্রেণি (Class 8)",
  },
  {
    student_code: "STU-2026-0002",
    full_name_bn: "তাসনিম আহমেদ",
    class_label_bn: "ষষ্ঠ শ্রেণি (Class 6)",
  },
];

const initialReportsByChild: Record<string, GuardianWeeklyChildReportResponse> = {
  "STU-2026-0001": {
    student: {
      id: 1,
      student_code: "STU-2026-0001",
      full_name_bn: "রাফি আহমেদ",
      full_name_en: "Rafi Ahmed",
    },
    generated_at: "2026-11-01T12:00:00Z",
    executive_summary_bn:
      "গত ৭ দিনে রাফি আহমেদ মোট ১৪৫ মিনিট সক্রিয়ভাবে পড়াশোনা করেছে এবং ৫টি টিউটর পাঠ সম্পন্ন করেছে। সার্বিক দক্ষতা ৬৯%।",
    analytics: {
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
          misconception_tags: ["sign_reversal_error"],
        },
      ],
      recommendations_bn: [
        {
          type: "remedial_lesson",
          priority: "high",
          learning_objective_id: 202,
          title_bn: "পুনরায় অনুশীলন প্রয়োজন: বাস্তব সমস্যার সমীকরণ গঠন ও সমাধান",
          description_bn:
            "এই শিখনফলে বর্তমান দক্ষতা ৪২%। এআই টিউটরের সাথে ধাপে ধাপে অনুশীলন করার পরামর্শ দেওয়া হচ্ছে।",
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
    },
  },
  "STU-2026-0002": {
    student: {
      id: 2,
      student_code: "STU-2026-0002",
      full_name_bn: "তাসনিম আহমেদ",
      full_name_en: "Tasnim Ahmed",
    },
    generated_at: "2026-11-01T12:00:00Z",
    executive_summary_bn:
      "গত ৭ দিনে তাসনিম আহমেদ মোট ১১০ মিনিট সক্রিয়ভাবে পড়াশোনা করেছে এবং ৪টি টিউটর পাঠ সম্পন্ন করেছে। সার্বিক দক্ষতা ৮১%।",
    analytics: {
      student_id: 2,
      student_code: "STU-2026-0002",
      snapshot: {
        overall_mastery_pct: 81.0,
        proficient_or_mastered_objectives: 5,
        total_tracked_objectives: 6,
        active_study_minutes_7d: 110,
        completed_tutor_sessions_7d: 4,
        exams_taken_30d: 2,
        average_exam_score_pct: 88.0,
      },
      subject_matrix: [
        {
          subject_id: 1,
          subject_name_bn: "গণিত (Mathematics)",
          subject_name_en: "Mathematics",
          tracked_objectives: 6,
          mastered_objectives: 5,
          average_mastery_pct: 81.0,
          status_bn: "পূর্ণ দক্ষ (Mastered)",
        },
      ],
      topic_weaknesses: [],
      recommendations_bn: [
        {
          type: "advance_next",
          priority: "low",
          learning_objective_id: null,
          title_bn: "দারুণ অগ্রগতি! পরবর্তী অধ্যায়ে এগিয়ে যাও",
          description_bn:
            "বর্তমান টপিকগুলোতে দক্ষতা সন্তোষজনক। স্টাডি প্ল্যান অনুযায়ী পরবর্তী নতুন টপিক শুরু করো।",
          action_label_bn: "স্টাডি প্ল্যান দেখো",
        },
      ],
      weekly_study_trend: [
        { date: "2026-10-26", active_minutes: 15 },
        { date: "2026-10-27", active_minutes: 20 },
        { date: "2026-10-28", active_minutes: 15 },
        { date: "2026-10-29", active_minutes: 20 },
        { date: "2026-10-30", active_minutes: 15 },
        { date: "2026-10-31", active_minutes: 10 },
        { date: "2026-11-01", active_minutes: 15 },
      ],
    },
  },
};

export default function GuardianParentDashboardPage(): React.JSX.Element {
  return (
    <AppShell title="অভিভাবক ড্যাশবোর্ড (Parent Progress Portal)">
      <GuardianParentPortalDashboard
        childrenList={childrenList}
        initialReportsByChild={initialReportsByChild}
      />
    </AppShell>
  );
}

