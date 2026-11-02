import { apiClient } from "@/services/api-client";
import type {
  GuardianWeeklyChildReportResponse,
  StudentAnalyticsDashboardResponse,
  SubjectMatrixRow,
  TopicWeaknessRow,
  BanglaRecommendation,
  DailyStudyTrendPoint,
} from "../types/analytics.types";

function normalizeAnalyticsResponse(raw: any): StudentAnalyticsDashboardResponse {
  if (!raw) {
    return {
      student_id: 0,
      student_code: "",
      snapshot: {
        overall_mastery_pct: 0,
        proficient_or_mastered_objectives: 0,
        total_tracked_objectives: 0,
        active_study_minutes_7d: 0,
        completed_tutor_sessions_7d: 0,
        exams_taken_30d: 0,
        average_exam_score_pct: 0,
      },
      subject_matrix: [],
      topic_weaknesses: [],
      recommendations_bn: [],
      weekly_study_trend: [],
    };
  }

  // If already in frontend shape:
  if (raw.snapshot && Array.isArray(raw.subject_matrix)) {
    return raw as StudentAnalyticsDashboardResponse;
  }

  // Normalize from backend 5-tier analytics:
  const tier1 = raw.tier_1_snapshot ?? {};
  const student = raw.student ?? {};

  const subject_matrix: SubjectMatrixRow[] = (raw.tier_2_subject_matrix ?? []).map(
    (item: any) => ({
      subject_id: item.subject_id ?? 0,
      subject_name_bn: item.title_bn ?? item.subject_name_bn ?? "বিষয়",
      subject_name_en: item.title_en ?? item.subject_name_en ?? "Subject",
      tracked_objectives: item.tracked_objectives ?? item.chapters_covered_count ?? 1,
      mastered_objectives: item.mastered_objectives ?? 0,
      average_mastery_pct: Number(item.average_mastery_pct ?? 0),
      status_bn: item.status_bn ?? (Number(item.average_mastery_pct ?? 0) >= 70 ? "অগ্রসর" : "অনুশীলন প্রয়োজন"),
    })
  );

  const topic_weaknesses: TopicWeaknessRow[] = (raw.tier_3_weaknesses ?? []).map(
    (item: any) => ({
      learning_objective_id: item.learning_objective_id ?? 0,
      code: item.objective_code ?? item.code ?? "",
      title_bn: item.title_bn ?? "",
      chapter_name_bn: item.chapter_title_bn ?? item.chapter_name_bn ?? "",
      subject_name_bn: item.subject_title_bn ?? item.subject_name_bn ?? "গণিত",
      mastery_score: Number(item.mastery_score ?? 0),
      mastery_level: item.mastery_status === "proficient" ? "proficient" : "developing",
      misconception_tags: item.recent_misconceptions ? [item.recent_misconceptions] : [],
    })
  );

  const recommendations_bn: BanglaRecommendation[] = (
    raw.tier_4_actionable_recommendations ?? []
  ).map((item: any) => ({
    type: "remedial_lesson" as const,
    priority: (item.priority ?? "medium") as "high" | "medium" | "low",
    learning_objective_id: null,
    title_bn: item.objective_code ? `লক্ষ্য: ${item.objective_code}` : "পাঠ সুপারিশ",
    description_bn: item.recommendation_bn ?? item.description_bn ?? "",
    action_label_bn: "টিউটরের সাথে শুরু করুন",
  }));

  const weekly_study_trend: DailyStudyTrendPoint[] = (
    raw.tier_5_weekly_trend ?? []
  ).map((item: any) => ({
    date: item.date ?? "",
    active_minutes: Number(item.active_minutes ?? 0),
  }));

  return {
    student_id: student.id ?? 1,
    student_code: student.student_code ?? "",
    snapshot: {
      overall_mastery_pct: Number(tier1.overall_mastery_percentage ?? 0),
      proficient_or_mastered_objectives: Number(
        tier1.objectives_proficient_or_mastered_count ?? 0
      ),
      total_tracked_objectives: Number(tier1.objectives_tracked_count ?? 0),
      active_study_minutes_7d: Number(tier1.active_study_minutes_last_7_days ?? 0),
      completed_tutor_sessions_7d: Number(tier1.exams_completed_count ?? 0),
      exams_taken_30d: Number(tier1.exams_completed_count ?? 0),
      average_exam_score_pct: Number(tier1.average_exam_score_percentage ?? 0),
    },
    subject_matrix,
    topic_weaknesses,
    recommendations_bn,
    weekly_study_trend,
  };
}

export const analyticsApi = {
  getStudentAnalytics: async (): Promise<StudentAnalyticsDashboardResponse> => {
    const response = await apiClient.get<any>("/analytics/me");
    return normalizeAnalyticsResponse(response.data);
  },

  getGuardianChildWeeklyReport: async (
    studentCode: string
  ): Promise<GuardianWeeklyChildReportResponse> => {
    const response = await apiClient.get<any>(
      `/guardians/children/${encodeURIComponent(studentCode)}/weekly-report`
    );
    const raw = response.data;
    const analytics = normalizeAnalyticsResponse(raw);

    const execSummary = raw?.tier_1_snapshot
      ? `গত ৭ দিনে শিক্ষার্থী মোট ${raw.tier_1_snapshot.active_study_minutes_last_7_days ?? 0} মিনিট পড়াশোনা করেছে। সামগ্রিক পাঠ্যক্রম দক্ষতা ${Number(raw.tier_1_snapshot.overall_mastery_percentage ?? 0).toFixed(1)}%।`
      : raw?.executive_summary_bn ?? "অগ্রগতি প্রতিবেদন প্রস্তুত হয়েছে।";

    return {
      student: {
        id: raw?.student?.id ?? analytics.student_id,
        student_code: raw?.student?.student_code ?? studentCode,
        full_name_bn: raw?.student?.name_bn ?? raw?.student?.full_name_bn ?? "শিক্ষার্থী",
        full_name_en: raw?.student?.name_en ?? raw?.student?.full_name_en ?? "Student",
      },
      generated_at: raw?.generated_at ?? new Date().toISOString(),
      executive_summary_bn: execSummary,
      analytics,
    };
  },

  getGuardianChildWeeklyReportPdfUrl(studentCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085/api/v1";
    return `${baseUrl}/guardians/children/${encodeURIComponent(studentCode)}/weekly-report/pdf`;
  },
};
