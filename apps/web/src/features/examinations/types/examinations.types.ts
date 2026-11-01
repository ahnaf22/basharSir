export type ExamQuestionType =
  | 'mcq_single'
  | 'mcq_multi_statement'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer'
  | 'math_problem'
  | 'creative_srijonshil'
  | 'descriptive';

export interface ExamQuestionOption {
  key: string;
  text_bn: string;
}

export interface CreativeSubQuestion {
  part: string;
  marks: number;
  text_bn: string;
}

export interface ExamQuestionItem {
  id: number;
  question_type: ExamQuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  stem_markdown: string;
  options_json: ExamQuestionOption[] | null;
  sub_questions_json: CreativeSubQuestion[] | null;
}

export interface RubricStepEvaluationItem {
  step_id: string;
  description_bn?: string;
  marks_awarded: number;
  max_marks: number;
  achieved?: boolean;
  is_correct?: boolean;
}

export interface AnswerEvaluationData {
  evaluator_type: 'deterministic' | 'ai_rubric' | 'human_reviewer';
  marks_awarded: number;
  max_marks: number;
  confidence_score: number;
  review_status: 'auto_approved' | 'provisional' | 'flagged_for_human' | 'human_verified';
  step_breakdown_json:
    | RubricStepEvaluationItem[]
    | {
        steps: RubricStepEvaluationItem[];
        missing_points_bn?: string[];
        detected_mistakes?: Array<{ code: string; description_bn: string }>;
      }
    | null;
  feedback_bn: string | null;
  nctb_citation: string | null;
}

export interface SubmittedAnswerItem {
  id?: number;
  question_id: number;
  answer_mode: 'mcq_choice' | 'typed_text' | 'handwritten_upload';
  selected_option_key: string | null;
  typed_answer_text: string | null;
  is_flagged_for_review: boolean;
  time_spent_seconds: number;
  evaluation: AnswerEvaluationData | null;
}

export interface ExamAttemptData {
  id: number;
  uuid: string;
  exam_id: number;
  student_id: number;
  status: 'in_progress' | 'submitted' | 'evaluating' | 'provisional_graded' | 'final_graded';
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  obtained_marks: number;
  total_marks: number;
  percentage_score: number;
  exam: {
    id: number;
    title_bn: string;
    exam_type: 'chapter' | 'subject' | 'model_board';
    duration_minutes: number;
    total_marks: number;
  };
  questions: ExamQuestionItem[];
  submitted_answers: SubmittedAnswerItem[];
}

