'use client';

import React, { useState } from 'react';
import { MathBanglaText } from '@/components/math-bangla/MathBanglaText';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { TutorSessionData } from '../types/tutor.types';

interface TutorCenterLessonCanvasProps {
  session: TutorSessionData;
  isSubmitting: boolean;
  onSubmitAnswer: (answerText: string) => void;
  onRequestHint: () => void;
}

const QUICK_MATH_SNIPPETS: ReadonlyArray<{ label: string; insert: string }> = [
  { label: 'x²', insert: 'x^2' },
  { label: 'a²', insert: 'a^2' },
  { label: '(a+b)²', insert: '(a+b)^2' },
  { label: 'a²+2ab+b²', insert: 'a^2+2ab+b^2' },
  { label: '+', insert: '+' },
  { label: '-', insert: '-' },
];

export function TutorCenterLessonCanvas({
  session,
  isSubmitting,
  onSubmitAnswer,
  onRequestHint,
}: TutorCenterLessonCanvasProps): React.ReactElement {
  const [answerInput, setAnswerInput] = useState<string>('');
  const latestTurn = session.latest_tutor_turn;
  const payload = latestTurn?.payload ?? null;
  const unlockedHintsCount = session.state_metadata.hints_used_current_turn;
  const availableHints = payload?.hints ?? [];
  const isCompleted = session.current_stage === 'COMPLETED';

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!answerInput.trim() || isSubmitting) {
      return;
    }
    onSubmitAnswer(answerInput.trim());
    setAnswerInput('');
  };

  const handleInsertSnippet = (snippet: string): void => {
    setAnswerInput((prev) => `${prev}${snippet}`);
  };

  return (
    <main
      aria-label="এনসিটিবি পাঠ ও অনুশীলন বোর্ড"
      className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Top NCTB Textbook Grounding Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="font-bangla text-xs font-semibold text-teal-700">
            এনসিটিবি অনুমোদিত পাঠ্যবই রেফারেন্স
          </span>
          <h1 className="font-bangla text-lg font-bold text-[#0F2942]">
            {payload?.nctb_reference ?? 'অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়'}
          </h1>
        </div>
        <Badge variant="navy">{session.stage_label_bn}</Badge>
      </div>

      {/* Previous Answer Diagnostic Feedback Banner */}
      {payload?.evaluation_of_previous_answer.was_answered && (
        <div
          role="status"
          data-testid="answer-evaluation-banner"
          className={`rounded-lg border p-4 ${
            payload.evaluation_of_previous_answer.is_correct
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          <p className="font-bangla text-sm font-bold">
            {payload.evaluation_of_previous_answer.is_correct
              ? 'সঠিক উত্তর! তুমি নিয়মটি সঠিকভাবে প্রয়োগ করেছ।'
              : 'উত্তরটিতে একটু ভুল ধারণা (Misconception) ধরা পড়েছে — চলো সংশোধন করে নিই:'}
          </p>
          {payload.evaluation_of_previous_answer.misconception_code && (
            <p className="mt-1 font-mono text-xs text-amber-800">
              শনাক্তকৃত ভুলের ধরন: {payload.evaluation_of_previous_answer.misconception_code}
            </p>
          )}
        </div>
      )}

      {/* Concept Explanation & Worked Example Board */}
      {payload && (
        <section
          data-testid="concept-explanation-board"
          className="rounded-xl border border-slate-200 bg-[#FAF8F5] p-5"
        >
          <h2 className="mb-2 font-bangla text-sm font-bold text-[#0F2942]">
            গৃহশিক্ষকের ব্যাখ্যা:
          </h2>
          <MathBanglaText
            content={payload.explanation_bn}
            className="font-bangla text-base leading-relaxed text-slate-800"
          />

          {payload.worked_step_latex && (
            <div className="mt-4 rounded-lg border border-teal-200 bg-white p-4">
              <span className="block font-bangla text-xs font-semibold text-teal-800">
                গাণিতিক ধাপ (Worked Step):
              </span>
              <MathBanglaText
                content={`$$${payload.worked_step_latex}$$`}
                className="mt-1 text-slate-900"
              />
            </div>
          )}
        </section>
      )}

      {/* Post-Lesson Summary Card when Session is COMPLETED */}
      {isCompleted ? (
        <section
          data-testid="post-lesson-summary-card"
          className="rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bangla text-xl font-bold text-emerald-950">
              পাঠ সফলভাবে সম্পন্ন হয়েছে!
            </h2>
            <Badge variant="success">Completed</Badge>
          </div>
          <p className="mt-2 font-bangla text-sm text-emerald-900">
            তুমি এই শিখনফলের সবগুলো ধাপ ও সংক্ষিপ্ত মূল্যায়ন সম্পন্ন করেছ।
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <span className="block font-bangla text-xs text-slate-500">মোট প্রশ্ন উত্তর</span>
              <span className="font-bangla text-lg font-bold text-[#0F2942]">
                {toBanglaNumerals(session.state_metadata.questions_attempted)}টি
              </span>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <span className="block font-bangla text-xs text-slate-500">সঠিক উত্তর</span>
              <span className="font-bangla text-lg font-bold text-emerald-700">
                {toBanglaNumerals(session.state_metadata.questions_correct)}টি
              </span>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm">
              <span className="block font-bangla text-xs text-slate-500">অর্জিত দক্ষতা</span>
              <span className="font-bangla text-lg font-bold text-teal-700">
                {toBanglaNumerals(Math.round(session.mastery.score))}%
              </span>
            </div>
          </div>
        </section>
      ) : (
        /* Interactive Question & Answer Input Card */
        payload?.interactive_question && (
          <section
            data-testid="interactive-question-card"
            className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bangla text-xs font-bold uppercase tracking-wider text-teal-700">
                তোমার অনুশীলন প্রশ্ন
              </span>
              <Badge variant="teal">
                স্তর: {payload.interactive_question.difficulty}
              </Badge>
            </div>

            <div className="mt-3">
              <MathBanglaText
                content={payload.interactive_question.question_text_bn}
                className="font-bangla text-base font-semibold text-slate-900"
              />
            </div>

            {/* Math Symbol Quick-Insert Toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-bangla text-xs text-slate-500">প্রতীক যুক্ত করো:</span>
              {QUICK_MATH_SNIPPETS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleInsertSnippet(item.insert)}
                  className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 hover:border-teal-500 hover:bg-teal-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                aria-label="তোমার উত্তর লেখো"
                placeholder="এখানে তোমার উত্তর বা সমীকরণ লেখো (যেমন: 5x বা a^2+10a+25)..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 font-bangla text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              <Button type="submit" variant="primary" disabled={isSubmitting || !answerInput.trim()}>
                {isSubmitting ? 'যাচাই হচ্ছে...' : 'উত্তর জমা দাও'}
              </Button>
            </form>

            {/* Progressive 3-Level Hint Drawer */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bangla text-xs font-semibold text-slate-600">
                  ধাপে ধাপে ইঙ্গিত (ব্যবহৃত: {toBanglaNumerals(unlockedHintsCount)}/
                  {toBanglaNumerals(Math.max(availableHints.length, 3))})
                </span>
                {payload.allow_hint ? (
                  <button
                    type="button"
                    data-testid="unlock-hint-btn"
                    onClick={onRequestHint}
                    disabled={isSubmitting || unlockedHintsCount >= availableHints.length}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-bangla text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {unlockedHintsCount >= availableHints.length
                      ? 'সব ইঙ্গিত দেখানো হয়েছে'
                      : `ইঙ্গিত ${toBanglaNumerals(unlockedHintsCount + 1)} দেখো (দক্ষতা পয়েন্ট কিছুটা কমবে)`}
                  </button>
                ) : (
                  <span className="font-bangla text-xs font-medium text-rose-700">
                    সংক্ষিপ্ত মূল্যায়নে (Mini-Assessment) ইঙ্গিত বন্ধ থাকে
                  </span>
                )}
              </div>

              {unlockedHintsCount > 0 && (
                <ul data-testid="unlocked-hints-list" className="mt-3 space-y-2">
                  {availableHints.slice(0, unlockedHintsCount).map((hint) => (
                    <li
                      key={hint.level}
                      className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 font-bangla text-sm text-amber-950"
                    >
                      <strong className="mr-1.5">ইঙ্গিত {toBanglaNumerals(hint.level)}:</strong>
                      <MathBanglaText content={hint.text_bn} className="inline" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )
      )}
    </main>
  );
}

