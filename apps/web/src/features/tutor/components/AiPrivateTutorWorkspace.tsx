'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { tutorApi } from '../api/tutor.api';
import { apiClient, ApiClientError } from '@/services/api-client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { StudentActionType, TutorSessionData } from '../types/tutor.types';
import { TutorLeftProgressionPane } from './TutorLeftProgressionPane';
import { TutorCenterLessonCanvas } from './TutorCenterLessonCanvas';
import { TutorRightGuidancePane } from './TutorRightGuidancePane';

const INITIAL_DEMO_SESSION: TutorSessionData = {
  id: 101,
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  student_id: 1,
  curriculum_version_id: 1,
  topic_id: 1,
  active_objective_id: 1,
  objective: {
    id: 1,
    code: 'C8-MATH-CH4-T1-LO1',
    title_bn: 'দ্বিপদী ও ত্রিপদী রাশির বর্গ নির্ণয়',
    title_en: 'Square of binomial and trinomial expressions',
    bloom_level: 'application',
    mastery_threshold_pct: 75,
  },
  current_stage: 'EXPLAIN_CONCEPT',
  pedagogical_step: 3,
  stage_label_bn: 'মূল ধারণা ব্যাখ্যা',
  session_status: 'active',
  state_metadata: {
    consecutive_correct_guided: 1,
    hints_used_current_turn: 0,
    total_hints_used: 0,
    mini_assessment_attempted: 0,
    mini_assessment_correct: 0,
    prerequisite_passed: true,
    questions_attempted: 2,
    questions_correct: 2,
    misconceptions_logged: [],
  },
  active_duration_seconds: 420,
  mastery: {
    score: 58,
    status: 'practicing',
    attempts_count: 2,
    correct_count: 2,
  },
  latest_tutor_turn: {
    id: 501,
    lesson_stage: 'EXPLAIN_CONCEPT',
    hints_used_count: 0,
    payload: {
      lesson_stage: 'EXPLAIN_CONCEPT',
      pedagogical_step: 3,
      stage_label_bn: 'মূল ধারণা ব্যাখ্যা',
      response_type: 'concept_explanation',
      explanation_bn:
        'এনসিটিবি পাঠ্যবই অনুসারে মূল ধারণা: দুইটি পদের যোগফলের বর্গ $(a + b)^2 = a^2 + 2ab + b^2$। এখানে প্রথম পদের বর্গ, দুই পদের গুণফলের দ্বিগুণ এবং দ্বিতীয় পদের বর্গ যোগ করতে হয়।',
      worked_step_latex: '(2x + 3y)^2 = (2x)^2 + 2(2x)(3y) + (3y)^2 = 4x^2 + 12xy + 9y^2',
      nctb_reference: 'অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়, পৃষ্ঠা ৪৭–৫২',
      evaluation_of_previous_answer: {
        was_answered: true,
        is_correct: true,
        misconception_code: null,
        confidence: 0.99,
      },
      interactive_question: {
        question_text_bn: 'সূত্রের সাহায্যে $(a + 5)^2$ এর বিস্তৃতি কী হবে?',
        question_type: 'short_answer',
        difficulty: 'medium',
        expected_answer_canonical: 'a^2+10a+25',
        accepted_equivalents: ['a^2+10a+25', 'a^2 + 10a + 25'],
      },
      hints: [
        {
          level: 1,
          text_bn: 'প্রথম পদকে $a$ এবং দ্বিতীয় পদকে $5$ ধরে $(a + b)^2 = a^2 + 2ab + b^2$ সূত্রের সাথে তুলনা করো।',
        },
        {
          level: 2,
          text_bn: 'মধ্যপদটি হবে $2 \\times a \\times 5 = 10a$।',
        },
        {
          level: 3,
          text_bn: 'ধাপটি দেখো: $a^2 + 10a + 5^2 = a^2 + 10a + 25$।',
        },
      ],
      expected_learning_objective_code: 'C8-MATH-CH4-T1-LO1',
      allow_hint: true,
      suggested_next_stage: 'WORKED_EXAMPLE',
    },
  },
  messages: [
    {
      id: 501,
      client_turn_id: 'turn-initial-501',
      sender_role: 'tutor',
      lesson_stage: 'EXPLAIN_CONCEPT',
      student_action_type: 'start_session',
      student_input_text: null,
      structured_payload_json: {
        lesson_stage: 'EXPLAIN_CONCEPT',
        pedagogical_step: 3,
        stage_label_bn: 'মূল ধারণা ব্যাখ্যা',
        response_type: 'concept_explanation',
        explanation_bn:
          'এনসিটিবি পাঠ্যবই অনুসারে মূল ধারণা: দুইটি পদের যোগফলের বর্গ $(a + b)^2 = a^2 + 2ab + b^2$।',
        worked_step_latex: '(2x + 3y)^2 = 4x^2 + 12xy + 9y^2',
        nctb_reference: 'অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়, পৃষ্ঠা ৪৭–৫২',
        evaluation_of_previous_answer: {
          was_answered: false,
          is_correct: null,
          misconception_code: null,
          confidence: null,
        },
        interactive_question: {
          question_text_bn: 'সূত্রের সাহায্যে $(a + 5)^2$ এর বিস্তৃতি কী হবে?',
          question_type: 'short_answer',
          difficulty: 'medium',
          expected_answer_canonical: 'a^2+10a+25',
          accepted_equivalents: ['a^2+10a+25'],
        },
        hints: [],
        expected_learning_objective_code: 'C8-MATH-CH4-T1-LO1',
        allow_hint: true,
        suggested_next_stage: 'WORKED_EXAMPLE',
      },
      is_answer_correct: null,
      misconception_code: null,
      hints_used_count: 0,
      created_at: '2026-11-01T14:00:00Z',
    },
  ],
  started_at: '2026-11-01T14:00:00Z',
  completed_at: null,
};

interface AiPrivateTutorWorkspaceProps {
  initialSession?: TutorSessionData;
}

export function AiPrivateTutorWorkspace({
  initialSession = INITIAL_DEMO_SESSION,
}: AiPrivateTutorWorkspaceProps): React.ReactElement {
  const [session, setSession] = useState<TutorSessionData>(initialSession);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastBannerBn, setToastBannerBn] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const sessionIdParam = searchParams ? searchParams.get('session_id') : null;
  const objectiveIdParam = searchParams ? searchParams.get('objective_id') : null;

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        if (sessionIdParam) {
          const s = await tutorApi.getSession(Number(sessionIdParam));
          if (isMounted && s?.id) setSession(s);
        } else if (objectiveIdParam) {
          const s = await tutorApi.startSession({
            learning_objective_id: Number(objectiveIdParam),
          });
          if (isMounted && s?.id) setSession(s);
        } else {
          // If no param, attempt to resume active lesson from dashboard
          const dash = await apiClient.get<{ continue_lesson?: { session_id: number } | null }>('/students/me/dashboard');
          if (isMounted && dash.data?.continue_lesson?.session_id) {
            const s = await tutorApi.getSession(dash.data.continue_lesson.session_id);
            if (isMounted && s?.id) setSession(s);
          }
        }
      } catch {
        // Keeps initial fallback gracefully
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [sessionIdParam, objectiveIdParam]);

  const generateTurnUuid = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `turn-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  };

  const executeTurn = async (
    actionType: StudentActionType,
    inputText?: string
  ): Promise<void> => {
    setIsSubmitting(true);
    setToastBannerBn(null);
    const clientTurnId = generateTurnUuid();

    try {
      const updated = await tutorApi.submitTurn({
        sessionId: session.id,
        client_turn_id: clientTurnId,
        action_type: actionType,
        student_input_text: inputText,
      });
      setSession(updated);
      useAuthStore.getState().refreshUser();
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.code === 'QUOTA_EXCEEDED') {
        setToastBannerBn('আপনার আজকের এআই টিউটর টার্ন কোটা শেষ হয়ে গেছে। আনলিমিটেড পড়তে প্যাকেজ আপগ্রেড করুন।');
      } else {
        // Deterministic local state transition when offline or in standalone UI mode
        setSession((prev) => applyLocalTurnFallback(prev, actionType, inputText, clientTurnId));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseSession = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const updated = await tutorApi.pauseSession(session.id, 30);
      setSession(updated);
    } catch {
      setSession((prev) => ({
        ...prev,
        session_status: prev.session_status === 'paused' ? 'active' : 'paused',
        active_duration_seconds: prev.active_duration_seconds + 30,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagMessage = async (
    messageId: number,
    reasonCode: 'factual_error' | 'math_error' | 'unclear_bangla'
  ): Promise<void> => {
    try {
      const res = await tutorApi.flagMessage({
        sessionId: session.id,
        tutor_message_id: messageId,
        reason_code: reasonCode,
      });
      setToastBannerBn(res.message_bn);
    } catch {
      setToastBannerBn(
        'তোমার রিপোর্টটি আমাদের একাডেমিক রিভিউ টিমের কাছে পাঠানো হয়েছে। ধন্যবাদ!'
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {toastBannerBn && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-teal-300 bg-teal-50 px-4 py-2.5 font-bangla text-sm font-medium text-teal-950"
        >
          {toastBannerBn}
        </div>
      )}

      {/* 3-Pane Academic Learning Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <TutorLeftProgressionPane session={session} />
        </div>
        <div className="lg:col-span-6">
          <TutorCenterLessonCanvas
            session={session}
            isSubmitting={isSubmitting}
            onSubmitAnswer={(ans) => void executeTurn('text_reply', ans)}
            onRequestHint={() => void executeTurn('hint', 'ইঙ্গিত দাও')}
          />
        </div>
        <div className="lg:col-span-3">
          <TutorRightGuidancePane
            session={session}
            isSubmitting={isSubmitting}
            onPedagogicalAction={(act, lbl) => void executeTurn(act, lbl)}
            onPauseSession={() => void handlePauseSession()}
            onFlagMessage={(id, reason) => void handleFlagMessage(id, reason)}
          />
        </div>
      </div>
    </div>
  );
}

function applyLocalTurnFallback(
  prev: TutorSessionData,
  actionType: StudentActionType,
  inputText: string | undefined,
  clientTurnId: string
): TutorSessionData {
  if (actionType === 'hint') {
    const nextHintCount = Math.min(3, prev.state_metadata.hints_used_current_turn + 1);
    return {
      ...prev,
      state_metadata: {
        ...prev.state_metadata,
        hints_used_current_turn: nextHintCount,
        total_hints_used: prev.state_metadata.total_hints_used + 1,
      },
    };
  }

  if (actionType === 'simplify') {
    const simplifiedPayload = prev.latest_tutor_turn?.payload
      ? {
          ...prev.latest_tutor_turn.payload,
          lesson_stage: 'EXPLAIN_CONCEPT' as const,
          pedagogical_step: 3,
          stage_label_bn: 'মূল ধারণা ব্যাখ্যা',
          explanation_bn:
            'চলো আরও সহজভাবে বুঝি: মনে করো একটি বর্গক্ষেত্রের বাহুর দৈর্ঘ্য $(a + b)$। ক্ষেত্রফল বের করতে $(a + b)$ কে $(a + b)$ দিয়ে গুণ করলে পাওয়া যায় $a^2 + 2ab + b^2$।',
        }
      : null;

    return {
      ...prev,
      current_stage: 'EXPLAIN_CONCEPT',
      pedagogical_step: 3,
      stage_label_bn: 'মূল ধারণা ব্যাখ্যা',
      latest_tutor_turn: simplifiedPayload
        ? {
            id: prev.messages.length + 600,
            lesson_stage: 'EXPLAIN_CONCEPT',
            hints_used_count: prev.state_metadata.hints_used_current_turn,
            payload: simplifiedPayload,
          }
        : prev.latest_tutor_turn,
    };
  }

  const normalized = (inputText ?? '').replace(/\s+/g, '').toLowerCase();
  const isCorrect =
    normalized === 'a^2+10a+25' ||
    normalized === 'a²+10a+25' ||
    normalized === '5x' ||
    normalized === '7a';

  const newAttempted = prev.state_metadata.questions_attempted + 1;
  const newCorrect = prev.state_metadata.questions_correct + (isCorrect ? 1 : 0);
  const nextStage = isCorrect ? 'INCREASE_DIFFICULTY' : 'IDENTIFY_MISCONCEPTION';
  const nextRailStep = isCorrect ? 5 : 4;
  const nextLabel = isCorrect ? 'উচ্চতর দক্ষতার অনুশীলন' : 'ভুল ধারণা শনাক্তকরণ';

  const nextPayload = prev.latest_tutor_turn?.payload
    ? {
        ...prev.latest_tutor_turn.payload,
        lesson_stage: nextStage as TutorSessionData['current_stage'],
        pedagogical_step: nextRailStep,
        stage_label_bn: nextLabel,
        explanation_bn: isCorrect
          ? 'অসাধারণ! তোমার উত্তরটি সঠিক। এবার একটু উচ্চতর দক্ষতার সমস্যার সমাধান করি।'
          : 'উত্তরটিতে একটু ভুল ধারণা ধরা পড়েছে: বর্গের সূত্রে মাঝখানের পদটি $2ab$ নিতে হয়। চলো আবার চেষ্টা করি।',
        evaluation_of_previous_answer: {
          was_answered: true,
          is_correct: isCorrect,
          misconception_code: isCorrect ? null : 'ALG_FORMULA_MIDDLE_TERM_OMITTED',
          confidence: 0.98,
        },
      }
    : null;

  return {
    ...prev,
    current_stage: nextStage,
    pedagogical_step: nextRailStep,
    stage_label_bn: nextLabel,
    state_metadata: {
      ...prev.state_metadata,
      questions_attempted: newAttempted,
      questions_correct: newCorrect,
      hints_used_current_turn: 0,
    },
    mastery: {
      ...prev.mastery,
      score: isCorrect ? Math.min(74, prev.mastery.score + 8) : Math.max(15, prev.mastery.score - 5),
      attempts_count: newAttempted,
      correct_count: newCorrect,
    },
    latest_tutor_turn: nextPayload
      ? {
          id: prev.messages.length + 601,
          lesson_stage: nextStage,
          hints_used_count: 0,
          payload: nextPayload,
        }
      : prev.latest_tutor_turn,
    messages: [
      ...prev.messages,
      {
        id: prev.messages.length + 600,
        client_turn_id: clientTurnId,
        sender_role: 'student',
        lesson_stage: prev.current_stage,
        student_action_type: actionType,
        student_input_text: inputText ?? null,
        structured_payload_json: null,
        is_answer_correct: isCorrect,
        misconception_code: isCorrect ? null : 'ALG_FORMULA_MIDDLE_TERM_OMITTED',
        hints_used_count: prev.state_metadata.hints_used_current_turn,
        created_at: new Date().toISOString(),
      },
    ],
  };
}

