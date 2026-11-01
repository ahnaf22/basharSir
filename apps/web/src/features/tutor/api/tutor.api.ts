import { apiClient } from '@/services/api-client';
import type {
  StudentActionType,
  TutorSessionData,
} from '../types/tutor.types';

export interface StartTutorSessionInput {
  learning_objective_id: number;
}

export interface SubmitTutorTurnInput {
  sessionId: number;
  client_turn_id: string;
  action_type: StudentActionType;
  student_input_text?: string;
}

export interface FlagTutorMessageInput {
  sessionId: number;
  tutor_message_id: number;
  reason_code: 'factual_error' | 'math_error' | 'out_of_syllabus' | 'unclear_bangla' | 'other';
  student_comment?: string;
}

export const tutorApi = {
  startSession: async (input: StartTutorSessionInput): Promise<TutorSessionData> => {
    const response = await apiClient.post<TutorSessionData>('/tutor-sessions', input);
    return response.data;
  },

  getSession: async (sessionId: number): Promise<TutorSessionData> => {
    const response = await apiClient.get<TutorSessionData>(`/tutor-sessions/${sessionId}`);
    return response.data;
  },

  submitTurn: async ({
    sessionId,
    client_turn_id,
    action_type,
    student_input_text,
  }: SubmitTutorTurnInput): Promise<TutorSessionData> => {
    const response = await apiClient.post<TutorSessionData>(
      `/tutor-sessions/${sessionId}/turns`,
      {
        client_turn_id,
        action_type,
        student_input_text,
      }
    );
    return response.data;
  },

  pauseSession: async (
    sessionId: number,
    activeDurationDeltaSeconds = 30
  ): Promise<TutorSessionData> => {
    const response = await apiClient.post<TutorSessionData>(
      `/tutor-sessions/${sessionId}/pause`,
      {
        active_duration_delta_seconds: activeDurationDeltaSeconds,
      }
    );
    return response.data;
  },

  flagMessage: async ({
    sessionId,
    tutor_message_id,
    reason_code,
    student_comment,
  }: FlagTutorMessageInput): Promise<{ flag_id: number; status: string; message_bn: string }> => {
    const response = await apiClient.post<{
      flag_id: number;
      status: string;
      message_bn: string;
    }>(`/tutor-sessions/${sessionId}/flag`, {
      tutor_message_id,
      reason_code,
      student_comment,
    });
    return response.data;
  },
};

