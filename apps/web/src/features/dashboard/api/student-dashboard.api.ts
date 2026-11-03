import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';

export type DashboardTaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'rescheduled' | string;

export interface DashboardTaskDto {
  id: number;
  title_bn: string;
  task_type?: string;
  subject_title_bn: string;
  chapter_title_bn?: string;
  chapter_number?: number;
  estimated_minutes: number;
  actual_active_minutes?: number;
  status: DashboardTaskStatus;
  learning_objective_id: number | null;
}

export interface DashboardWeekDayDto {
  date: string;
  /** JS weekday: 0 = Sunday ... 6 = Saturday. The list is Saturday-first. */
  weekday: number;
  studied: boolean;
  is_today: boolean;
}

export type MasteryBlockState = 'mastered' | 'in_progress' | 'not_started';

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
    learning_objective_id: number;
    title_bn: string;
    chapter_title_bn: string;
    chapter_number: number;
    subject_title_bn: string;
    active_duration_seconds: number;
    estimated_remaining_minutes: number | null;
  } | null;
  /** Present only when there is no open tutor session: the first unfinished planned objective. */
  next_lesson: {
    learning_objective_id: number;
    title_bn: string;
    chapter_title_bn: string;
    chapter_number: number;
    subject_title_bn: string;
    estimated_minutes: number;
  } | null;
  today_tasks: DashboardTaskDto[];
  streak: {
    current_days: number;
    longest_days: number;
    freezes_available: number;
    last_active_date: string | null;
    week: DashboardWeekDayDto[];
    next_milestone: { target_days: number; remaining_days: number };
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
    level: {
      number: number;
      xp_into_level: number;
      xp_per_level: number;
      next_level_total_xp: number;
    };
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
    attempted_objectives: number;
    objectives: Array<{ id: number; state: MasteryBlockState }>;
    next_chapter: { id: number; chapter_number: number; title_bn: string } | null;
  }>;
  upcoming_exams: Array<{
    id: number;
    title_bn: string;
    subject_title_bn: string;
    exam_type: string;
    duration_minutes: number;
    total_marks: string;
    question_count: number;
    mcq_count: number;
    creative_count: number;
  }>;
}

export interface QuotaDto {
  used: number;
  limit: number;
  remaining: number;
}

export interface EntitlementsSnapshotDto {
  plan: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    tier: string;
    max_children_supported: number;
  };
  features: Record<string, { is_enabled: boolean; can_access: boolean; quota: QuotaDto | null }>;
}

export function fetchStudentDashboardApi(): Promise<
  ApiSuccessEnvelope<StudentDashboardDto>
> {
  return apiClient.get<StudentDashboardDto>('/students/me/dashboard');
}

export function fetchMyEntitlementsApi(): Promise<ApiSuccessEnvelope<EntitlementsSnapshotDto>> {
  return apiClient.get<EntitlementsSnapshotDto>('/me/entitlements');
}

/** Marks a planned task done / undone through the study-planner contract. */
export function setStudyTaskStatusApi(
  itemId: number,
  status: 'completed' | 'scheduled',
): Promise<ApiSuccessEnvelope<{ id: number; status: string }>> {
  return apiClient.patch<{ id: number; status: string }>(
    `/study-plan-items/${itemId}/reschedule`,
    { status },
  );
}
