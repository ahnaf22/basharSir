import { apiClient } from '@/services/api-client';
import type {
  ExamAttemptData,
  SubmittedAnswerItem,
} from '../types/examinations.types';

export interface GenerateExamInput {
  subject_id: number;
  exam_type: 'chapter' | 'subject' | 'model_board';
  title_bn: string;
  chapter_ids?: number[];
  duration_minutes?: number;
}

export const examinationsApi = {
  generateAndStart: async (input: GenerateExamInput): Promise<ExamAttemptData> => {
    const response = await apiClient.post<ExamAttemptData>('/exams/generate', input);
    return response.data;
  },

  getAttempt: async (attemptId: number): Promise<ExamAttemptData> => {
    const response = await apiClient.get<ExamAttemptData>(`/exam-attempts/${attemptId}`);
    return response.data;
  },

  autosaveAnswers: async (
    attemptId: number,
    answers: Array<Omit<SubmittedAnswerItem, 'id' | 'evaluation'>>
  ): Promise<ExamAttemptData> => {
    const response = await apiClient.put<ExamAttemptData>(
      `/exam-attempts/${attemptId}/answers`,
      { answers }
    );
    return response.data;
  },

  submitAttempt: async (attemptId: number): Promise<ExamAttemptData> => {
    const response = await apiClient.post<ExamAttemptData>(
      `/exam-attempts/${attemptId}/submit`
    );
    return response.data;
  },

  getMyExamAttempts: async (): Promise<{ attempts: ExamAttemptData[] }> => {
    const response = await apiClient.get<{ attempts: ExamAttemptData[] }>(
      '/students/me/exam-attempts'
    );
    return response.data;
  },
};

