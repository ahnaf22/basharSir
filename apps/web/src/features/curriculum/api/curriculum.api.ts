import { apiClient, type ApiSuccessEnvelope } from '@/services/api-client';
import type {
  ChapterDto,
  LearningResourceDto,
  ResourceAnnotationDto,
  ResourceType,
  ResourceWorkflowStatus,
  SubjectDto,
  TopicDto,
} from '@/features/curriculum/types/curriculum.types';

export function fetchSubjectsByGradeApi(gradeLevel: number): Promise<
  ApiSuccessEnvelope<{
    curriculum_version_code: string;
    grade_level: number;
    class_title_bn: string;
    subjects: SubjectDto[];
  }>
> {
  return apiClient.get('/subjects', {
    params: { grade_level: gradeLevel },
  });
}

export function fetchChaptersBySubjectApi(subjectId: number): Promise<
  ApiSuccessEnvelope<{
    subject: SubjectDto;
    chapters: ChapterDto[];
  }>
> {
  return apiClient.get(`/subjects/${subjectId}/chapters`);
}

export function fetchTopicsByChapterApi(chapterId: number): Promise<
  ApiSuccessEnvelope<{
    chapter: ChapterDto;
    topics: TopicDto[];
  }>
> {
  return apiClient.get(`/chapters/${chapterId}/topics`);
}

export function fetchChapterResourcesApi(chapterId: number): Promise<
  ApiSuccessEnvelope<{
    chapter_id: number;
    chapter_title_bn: string;
    resources: LearningResourceDto[];
  }>
> {
  return apiClient.get(`/chapters/${chapterId}/resources`);
}

export function createLearningResourceApi(payload: {
  curriculum_version_id: number;
  chapter_id: number;
  topic_id?: number | null;
  learning_objective_id?: number | null;
  resource_type: ResourceType;
  title_bn: string;
  content_markdown: string;
  nctb_page_reference?: string;
}): Promise<ApiSuccessEnvelope<LearningResourceDto>> {
  return apiClient.post<LearningResourceDto>('/resources', payload);
}

export function transitionResourceWorkflowApi(
  resourceId: number,
  targetStatus: ResourceWorkflowStatus
): Promise<ApiSuccessEnvelope<LearningResourceDto>> {
  return apiClient.post<LearningResourceDto>(
    `/resources/${resourceId}/workflow`,
    { target_status: targetStatus }
  );
}

export function saveResourceAnnotationApi(
  resourceId: number,
  payload: {
    is_bookmarked: boolean;
    highlights?: string[];
    personal_note_markdown?: string;
  }
): Promise<ApiSuccessEnvelope<ResourceAnnotationDto>> {
  return apiClient.put<ResourceAnnotationDto>(
    `/resources/${resourceId}/annotations`,
    payload
  );
}

export function getResourcePdfDownloadUrl(resourceId: number): string {
  return apiClient.buildUrl(`/resources/${resourceId}/pdf`);
}

