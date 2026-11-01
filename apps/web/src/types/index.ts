export type UserRole = 'student' | 'guardian' | 'admin' | 'content_reviewer' | 'teacher';

export type ConsentStatus = 'pending' | 'verified' | 'revoked';

export type EducationMedium = 'bangla' | 'english_version';

export interface CurriculumContextRef {
  curriculum_version_id: number;
  curriculum_version_code: string;
  class_id: number;
  subject_id?: number;
  chapter_id?: number;
  topic_id?: number;
  learning_objective_id?: number;
}

