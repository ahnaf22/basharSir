'use client';

import React, { useState } from 'react';
import { MathBanglaText } from '@/components/math-bangla/MathBanglaText';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import type { StudentActionType, TutorSessionData } from '../types/tutor.types';

interface TutorRightGuidancePaneProps {
  session: TutorSessionData;
  isSubmitting: boolean;
  onPedagogicalAction: (action: StudentActionType, labelBn: string) => void;
  onPauseSession: () => void;
  onFlagMessage: (messageId: number, reasonCode: 'factual_error' | 'math_error' | 'unclear_bangla') => void;
}

const PEDAGOGICAL_ACTION_BUTTONS: ReadonlyArray<{
  action: StudentActionType;
  labelBn: string;
  descriptionBn: string;
}> = [
  {
    action: 'simplify',
    labelBn: 'আরেকটু সহজ করে বোঝাও',
    descriptionBn: 'দৈনন্দিন উদাহরণ দিয়ে সহজ ব্যাখ্যা',
  },
  {
    action: 'example',
    labelBn: 'আরেকটি উদাহরণ দাও',
    descriptionBn: 'পাঠ্যবইয়ের সমজাতীয় আদর্শ সমাধান',
  },
  {
    action: 'hint',
    labelBn: 'ইঙ্গিত দাও',
    descriptionBn: 'সরাসরি উত্তর না বলে পরবর্তী ধাপের সূত্র',
  },
  {
    action: 'previous_step',
    labelBn: 'আগের অংশে ফিরে যাও',
    descriptionBn: 'পূর্ববর্তী ধারণা বা ধাপে পুনরায় ফেরা',
  },
];

export function TutorRightGuidancePane({
  session,
  isSubmitting,
  onPedagogicalAction,
  onPauseSession,
  onFlagMessage,
}: TutorRightGuidancePaneProps): React.ReactElement {
  const [flaggedMessageIds, setFlaggedMessageIds] = useState<number[]>([]);
  const activeMins = Math.max(1, Math.round(session.active_duration_seconds / 60));
  const isMiniAssessment = session.current_stage === 'MINI_ASSESSMENT';

  const handleFlagClick = (msgId: number): void => {
    if (flaggedMessageIds.includes(msgId)) {
      return;
    }
    setFlaggedMessageIds((prev) => [...prev, msgId]);
    onFlagMessage(msgId, 'unclear_bangla');
  };

  return (
    <aside
      aria-label="সহকারী গৃহশিক্ষক নিয়ন্ত্রণ ও কথোপকথন"
      className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Session Status & Pause Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-bangla text-base font-bold text-[#0F2942]">
            গৃহশিক্ষক সহায়তা প্যানেল
          </h2>
          <p className="font-bangla text-xs text-slate-500">
            সক্রিয় পাঠ সময়: {toBanglaNumerals(activeMins)} মিনিট
          </p>
        </div>
        <button
          type="button"
          data-testid="pause-session-btn"
          onClick={onPauseSession}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-bangla text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          {session.session_status === 'paused' ? 'পাঠ চালু করো' : 'বিরতি নাও (Pause)'}
        </button>
      </div>

      {/* 1-Click Bangla Pedagogical Action Buttons */}
      <div>
        <h3 className="mb-2.5 font-bangla text-xs font-semibold uppercase tracking-wider text-slate-500">
          এক-ক্লিকে গৃহশিক্ষকের সাহায্য নাও
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {PEDAGOGICAL_ACTION_BUTTONS.map((btn) => {
            const disabledForMini = isMiniAssessment && btn.action === 'hint';
            return (
              <button
                key={btn.action}
                type="button"
                data-testid={`pedagogical-action-${btn.action}`}
                disabled={isSubmitting || disabledForMini}
                onClick={() => onPedagogicalAction(btn.action, btn.labelBn)}
                className="flex flex-col items-start rounded-lg border border-teal-200 bg-teal-50/40 px-3.5 py-2.5 text-left transition hover:border-teal-600 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-bangla text-sm font-bold text-[#0F2942]">
                  {btn.labelBn}
                </span>
                <span className="font-bangla text-xs text-slate-600">
                  {btn.descriptionBn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Turn History & One-Click Hallucination / Quality Escalation */}
      <div className="flex-1">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="font-bangla text-xs font-semibold uppercase tracking-wider text-slate-500">
            সাম্প্রতিক পাঠের ধাপসমূহ
          </h3>
          <Badge variant="neutral">
            {toBanglaNumerals(session.messages.length)}টি ধাপ
          </Badge>
        </div>

        <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
          {session.messages.map((msg) => {
            const isTutor = msg.sender_role === 'tutor';
            const isFlagged = flaggedMessageIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`rounded-lg border p-3 text-xs ${
                  isTutor
                    ? 'border-slate-200 bg-slate-50 text-slate-800'
                    : 'border-teal-200 bg-teal-50/40 text-slate-900'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-bangla font-bold text-[#0F2942]">
                    {isTutor ? 'এআই গৃহশিক্ষক' : 'তুমি'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {msg.lesson_stage}
                  </span>
                </div>

                {isTutor && msg.structured_payload_json ? (
                  <MathBanglaText
                    content={msg.structured_payload_json.explanation_bn}
                    className="font-bangla text-xs leading-relaxed text-slate-700"
                  />
                ) : (
                  <p className="font-bangla text-xs text-slate-800">
                    {msg.student_input_text ?? msg.student_action_type}
                  </p>
                )}

                {isTutor && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      data-testid={`flag-tutor-msg-${msg.id}`}
                      onClick={() => handleFlagClick(msg.id)}
                      disabled={isFlagged}
                      className="font-bangla text-[11px] font-medium text-slate-500 underline hover:text-rose-700 disabled:no-underline"
                    >
                      {isFlagged
                        ? 'রিপোর্ট গ্রহণ করা হয়েছে ✓'
                        : 'তথ্যটি ভুল মনে হচ্ছে? রিপোর্ট করো'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

