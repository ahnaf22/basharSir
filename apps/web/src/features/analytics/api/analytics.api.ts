import { apiClient } from "@/services/api-client";
import type {
  GuardianWeeklyChildReportResponse,
  StudentAnalyticsDashboardResponse,
} from "../types/analytics.types";

export const analyticsApi = {
  getStudentAnalytics: async (): Promise<StudentAnalyticsDashboardResponse> => {
    const response = await apiClient.get<StudentAnalyticsDashboardResponse>("/analytics/me");
    return response.data;
  },

  getGuardianChildWeeklyReport: async (
    studentCode: string
  ): Promise<GuardianWeeklyChildReportResponse> => {
    const response = await apiClient.get<GuardianWeeklyChildReportResponse>(
      `/guardians/children/${encodeURIComponent(studentCode)}/weekly-report`
    );
    return response.data;
  },

  getGuardianChildWeeklyReportPdfUrl(studentCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
    return `${baseUrl}/guardians/children/${encodeURIComponent(studentCode)}/weekly-report/pdf`;
  },
};
