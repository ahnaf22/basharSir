export type ResourceType =
  | 'lesson_note'
  | 'summary'
  | 'definition'
  | 'worked_example'
  | 'diagram'
  | 'formula_sheet';

export type ResourceWorkflowStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'archived';

export interface PrerequisiteObjectiveRefDto {
  id: number;
  code: string;
  title_bn: string;
  title_en: string;
}

export interface LearningObjectiveDto {
  id: number;
  topic_id: number;
  code: string;
  title_bn: string;
  title_en: string;
  bloom_level: 'knowledge' | 'comprehension' | 'application' | 'higher_order';
  mastery_threshold_pct: number;
  sort_order: number;
  prerequisites?: PrerequisiteObjectiveRefDto[];
}

export interface TopicDto {
  id: number;
  chapter_id: number;
  topic_number: string;
  title_bn: string;
  title_en: string;
  estimated_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  sort_order: number;
  learning_objectives?: LearningObjectiveDto[];
}

export interface ChapterDto {
  id: number;
  subject_id: number;
  chapter_number: number;
  title_bn: string;
  title_en: string;
  syllabus_status: 'included' | 'excluded_for_short_syllabus';
  estimated_study_minutes: number;
  sort_order: number;
  topics?: TopicDto[];
}

export interface SubjectDto {
  id: number;
  class_id: number;
  nctb_subject_code: string;
  title_bn: string;
  title_en: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  chapters?: ChapterDto[];
}

export interface LearningResourceDto {
  id: number;
  curriculum_version_id: number;
  chapter_id: number;
  topic_id: number | null;
  learning_objective_id: number | null;
  resource_type: ResourceType;
  title_bn: string;
  content_markdown: string;
  nctb_page_reference: string | null;
  workflow_status: ResourceWorkflowStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  published_at: string | null;
  vector_embedding_id: string | null;
  rag_chunks_count?: number;
}

export interface ResourceAnnotationDto {
  id: number;
  learning_resource_id: number;
  is_bookmarked: boolean;
  highlights: string[] | null;
  personal_note_markdown: string | null;
}

