import { apiClient } from '@/services/api-client';
import type {
  CalendarSummaryData,
  HeartbeatResponseData,
  StudyPlanData,
  StudyTaskStatus,
} from '../types/study-planner.types';

export interface CreateStudyPlanPayload {
  title: string;
  chapter_ids: number[];
  target_completion_date: string;
  daily_study_minutes: number;
}

export interface RescheduleItemPayload {
  itemId: number;
  scheduled_date?: string;
  status?: StudyTaskStatus;
  actual_active_minutes?: number;
}

export interface SendHeartbeatPayload {
  source_type: 'tutor_session' | 'exam_attempt' | 'resource_study';
  source_id: number;
  subject_id?: number;
  is_idle: boolean;
  elapsed_seconds: number;
  questions_attempted_delta?: number;
}

export const studyPlannerApi = {
  createPlan: async (payload: CreateStudyPlanPayload): Promise<StudyPlanData> => {
    const response = await apiClient.post<StudyPlanData>('/study-plans', payload);
    return response.data;
  },

  getActivePlan: async (): Promise<StudyPlanData | null> => {
    const response = await apiClient.get<StudyPlanData | null>('/study-plans/active');
    return response.data;
  },

  rebalancePlan: async (planId: number): Promise<StudyPlanData> => {
    const response = await apiClient.post<StudyPlanData>(
      `/study-plans/${planId}/rebalance`
    );
    return response.data;
  },

  rescheduleItem: async ({
    itemId,
    scheduled_date,
    status,
    actual_active_minutes,
  }: RescheduleItemPayload): Promise<{
    id: number;
    scheduled_date: string;
    status: StudyTaskStatus;
    rescheduled_from_date: string | null;
    actual_active_minutes: number;
  }> => {
    const response = await apiClient.patch<{
      id: number;
      scheduled_date: string;
      status: StudyTaskStatus;
      rescheduled_from_date: string | null;
      actual_active_minutes: number;
    }>(`/study-plan-items/${itemId}/reschedule`, {
      scheduled_date,
      status,
      actual_active_minutes,
    });
    return response.data;
  },

  getCalendar: async (
    startDate?: string,
    endDate?: string
  ): Promise<CalendarSummaryData> => {
    const response = await apiClient.get<CalendarSummaryData>('/calendar', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  sendHeartbeat: async (
    payload: SendHeartbeatPayload
  ): Promise<HeartbeatResponseData> => {
    const response = await apiClient.post<HeartbeatResponseData>(
      '/analytics/study-heartbeat',
      payload
    );
    return response.data;
  },
};

