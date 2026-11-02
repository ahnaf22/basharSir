import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';

export interface StudentDashboardDto {
  student: {
    student_code: string;
    name_bn: string | null;
    name_en: string;
    current_class_level: number;
    medium: string;
    daily_study_target_mins: number;
  };
  continue_lesson: {
    session_id: number;
    session_uuid: string;
    current_stage: string;
    title_bn: string;
    chapter_title_bn: string;
    subject_title_bn: string;
    active_duration_seconds: number;
  } | null;
  today_tasks: Array<{
    id: number;
    title_bn: string;
    subject_title_bn: string;
    estimated_minutes: number;
    status: string;
    learning_objective_id: number;
  }>;
  streak: {
    current_days: number;
    longest_days: number;
    freezes_available: number;
    last_active_date: string | null;
  };
  gamification: {
    total_xp: number;
    badges_count: number;
    badges: Array<{
      id: number;
      badge_code: string;
      title_bn: string;
      awarded_at: string;
    }>;
  };
  today_study_time: {
    active_seconds: number;
    active_minutes: number;
    target_minutes: number;
  };
  subject_mastery: Array<{
    id: number;
    title_bn: string;
    title_en: string;
    subject_code: string;
    mastery_pct: number;
    total_chapters: number;
    total_objectives: number;
    mastered_objectives: number;
  }>;
  upcoming_exams: Array<{
    id: number;
    title_bn: string;
    subject_title_bn: string;
    duration_minutes: number;
    total_marks: string;
  }>;
}

export function fetchStudentDashboardApi(): Promise<
  ApiSuccessEnvelope<StudentDashboardDto>
> {
  return apiClient.get<StudentDashboardDto>('/students/me/dashboard');
}

