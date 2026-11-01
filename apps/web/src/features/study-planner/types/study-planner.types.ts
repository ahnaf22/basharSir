export type StudyTaskType =
  | 'concept_lesson'
  | 'prerequisite_remedial'
  | 'guided_practice'
  | 'revision'
  | 'chapter_quiz';

export type StudyTaskStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'rescheduled';

export interface StudyPlanItemData {
  id: number;
  study_plan_id: number;
  subject_id?: number;
  chapter_id?: number;
  topic_id?: number | null;
  learning_objective_id?: number | null;
  task_type: StudyTaskType;
  title_bn: string;
  scheduled_date: string;
  planned_minutes: number;
  actual_active_minutes: number;
  status: StudyTaskStatus;
  rescheduled_from_date: string | null;
  completed_at?: string | null;
}

export interface StudyPlanData {
  id: number;
  student_id: number;
  curriculum_version_id: number;
  title: string;
  target_completion_date: string;
  daily_study_minutes: number;
  status: 'active' | 'completed' | 'archived';
  completion_percentage: number;
  config_json: {
    selected_chapter_ids?: number[];
    coach_message_bn?: string;
  };
  items: StudyPlanItemData[];
}

export interface CalendarSummaryData {
  start_date: string;
  end_date: string;
  total_active_minutes: number;
  total_paused_minutes: number;
  items: StudyPlanItemData[];
}

export interface HeartbeatResponseData {
  log_id: number;
  study_date: string;
  active_seconds: number;
  paused_seconds: number;
  questions_attempted: number;
}

