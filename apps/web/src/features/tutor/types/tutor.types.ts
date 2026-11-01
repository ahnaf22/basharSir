export type TutorLessonStage =
  | 'START_LESSON'
  | 'CHECK_PREREQUISITES'
  | 'TEACH_PREREQUISITE'
  | 'EXPLAIN_CONCEPT'
  | 'WORKED_EXAMPLE'
  | 'ASK_STUDENT_QUESTION'
  | 'IDENTIFY_MISCONCEPTION'
  | 'EXPLAIN_CORRECTION'
  | 'ASK_SIMILAR_QUESTION'
  | 'INCREASE_DIFFICULTY'
  | 'MINI_ASSESSMENT'
  | 'SAVE_LEARNING_PROGRESS'
  | 'COMPLETED';

export type StudentActionType =
  | 'text_reply'
  | 'simplify'
  | 'example'
  | 'hint'
  | 'previous_step';

export interface TutorHintItem {
  level: number;
  text_bn: string;
}

export interface TutorInteractiveQuestion {
  question_text_bn: string;
  question_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expected_answer_canonical: string;
  accepted_equivalents: string[];
}

export interface TutorAnswerEvaluation {
  was_answered: boolean;
  is_correct: boolean | null;
  misconception_code: string | null;
  confidence: number | null;
}

export interface TutorStructuredPayload {
  lesson_stage: TutorLessonStage;
  pedagogical_step: number;
  stage_label_bn: string;
  response_type: string;
  explanation_bn: string;
  worked_step_latex: string | null;
  nctb_reference: string;
  evaluation_of_previous_answer: TutorAnswerEvaluation;
  interactive_question: TutorInteractiveQuestion;
  hints: TutorHintItem[];
  expected_learning_objective_code: string;
  allow_hint: boolean;
  suggested_next_stage: string;
}

export interface TutorMessageItem {
  id: number;
  client_turn_id: string;
  sender_role: 'tutor' | 'student' | 'system';
  lesson_stage: TutorLessonStage;
  student_action_type: StudentActionType | 'start_session' | null;
  student_input_text: string | null;
  structured_payload_json: TutorStructuredPayload | null;
  is_answer_correct: boolean | null;
  misconception_code: string | null;
  hints_used_count: number;
  created_at: string | null;
}

export interface TutorSessionStateMetadata {
  consecutive_correct_guided: number;
  hints_used_current_turn: number;
  total_hints_used: number;
  mini_assessment_attempted: number;
  mini_assessment_correct: number;
  prerequisite_passed: boolean;
  questions_attempted: number;
  questions_correct: number;
  misconceptions_logged: string[];
}

export interface TutorSessionData {
  id: number;
  uuid: string;
  student_id: number;
  curriculum_version_id: number;
  topic_id: number;
  active_objective_id: number;
  objective: {
    id: number;
    code: string;
    title_bn: string;
    title_en: string;
    bloom_level: string;
    mastery_threshold_pct: number;
  };
  current_stage: TutorLessonStage;
  pedagogical_step: number;
  stage_label_bn: string;
  session_status: 'active' | 'paused' | 'completed' | 'abandoned';
  state_metadata: TutorSessionStateMetadata;
  active_duration_seconds: number;
  mastery: {
    score: number;
    status: 'unstarted' | 'struggling' | 'practicing' | 'proficient' | 'mastered';
    attempts_count: number;
    correct_count: number;
  };
  latest_tutor_turn: {
    id: number;
    lesson_stage: TutorLessonStage;
    hints_used_count: number;
    payload: TutorStructuredPayload;
  } | null;
  messages: TutorMessageItem[];
  started_at: string;
  completed_at: string | null;
}

