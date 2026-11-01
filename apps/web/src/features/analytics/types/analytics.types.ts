export interface AnalyticsSnapshot {
  overall_mastery_pct: number;
  proficient_or_mastered_objectives: number;
  total_tracked_objectives: number;
  active_study_minutes_7d: number;
  completed_tutor_sessions_7d: number;
  exams_taken_30d: number;
  average_exam_score_pct: number;
}

export interface SubjectMatrixRow {
  subject_id: number;
  subject_name_bn: string;
  subject_name_en: string;
  tracked_objectives: number;
  mastered_objectives: number;
  average_mastery_pct: number;
  status_bn: string;
}

export interface TopicWeaknessRow {
  learning_objective_id: number;
  code: string;
  title_bn: string;
  chapter_name_bn: string;
  subject_name_bn: string;
  mastery_score: number;
  mastery_level: "not_started" | "emerging" | "developing" | "proficient" | "mastered";
  misconception_tags: string[];
}

export interface BanglaRecommendation {
  type: "remedial_lesson" | "revision_quiz" | "advance_next";
  priority: "high" | "medium" | "low";
  learning_objective_id: number | null;
  title_bn: string;
  description_bn: string;
  action_label_bn: string;
}

export interface DailyStudyTrendPoint {
  date: string;
  active_minutes: number;
}

export interface StudentAnalyticsDashboardResponse {
  student_id: number;
  student_code: string;
  snapshot: AnalyticsSnapshot;
  subject_matrix: SubjectMatrixRow[];
  topic_weaknesses: TopicWeaknessRow[];
  recommendations_bn: BanglaRecommendation[];
  weekly_study_trend: DailyStudyTrendPoint[];
}

export interface GuardianWeeklyChildReportResponse {
  student: {
    id: number;
    student_code: string;
    full_name_bn: string;
    full_name_en: string;
  };
  generated_at: string;
  executive_summary_bn: string;
  analytics: StudentAnalyticsDashboardResponse;
}

