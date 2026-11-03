'use client';

import React from 'react';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import type { TutorSessionData } from '../types/tutor.types';

interface TutorLeftProgressionPaneProps {
  session: TutorSessionData;
}

const PEDAGOGICAL_RAIL_STEPS: ReadonlyArray<{
  step: number;
  titleBn: string;
  subtitleBn: string;
}> = [
  { step: 1, titleBn: 'পাঠের সূচনা ও শিখনফল', subtitleBn: 'Welcome & Objective' },
  { step: 2, titleBn: 'পূর্বজ্ঞান যাচাই', subtitleBn: 'Prerequisite Check' },
  { step: 3, titleBn: 'মূল ধারণা ও উদাহরণ', subtitleBn: 'Concept & Worked Example' },
  { step: 4, titleBn: 'ইন্টারেক্টিভ অনুশীলন', subtitleBn: 'Guided Practice' },
  { step: 5, titleBn: 'উচ্চতর দক্ষতার অনুশীলন', subtitleBn: 'Higher-Order Practice' },
  { step: 6, titleBn: 'সংক্ষিপ্ত মূল্যায়ন', subtitleBn: 'Mini-Assessment (No Hints)' },
  { step: 7, titleBn: 'পাঠ সমাপ্তি ও অগ্রগতি', subtitleBn: 'Mastery & Summary' },
];

const MASTERY_STATUS_LABELS: Record<TutorSessionData['mastery']['status'], string> = {
  unstarted: 'এখনো শুরু হয়নি',
  struggling: 'অতিরিক্ত অনুশীলন প্রয়োজন',
  practicing: 'অনুশীলনরত',
  proficient: 'দক্ষতা অর্জিত',
  mastered: 'সম্পূর্ণ আয়ত্ত',
};

export function TutorLeftProgressionPane({
  session,
}: TutorLeftProgressionPaneProps): React.ReactElement {
  const activeRailStep = session.pedagogical_step;
  const masteryPct = Math.round(session.mastery.score);

  return (
    <aside
      aria-label="পাঠের ধাপ ও দক্ষতা অগ্রগতি"
      className="flex flex-col gap-5 rounded-xl border border-desk-line bg-desk-paper p-5 shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-desk-accent-ink">
            {session.objective.code}
          </span>
          <Badge variant={session.session_status === 'completed' ? 'success' : 'teal'}>
            {session.stage_label_bn}
          </Badge>
        </div>
        <h2 className="mt-1.5 font-bangla text-base font-bold text-desk-text">
          {session.objective.title_bn}
        </h2>
      </div>

      {/* Evidence-Based Mastery Progress Card */}
      <div className="rounded-lg border border-desk-line-soft bg-desk-paper-2 p-3.5">
        <div className="flex items-center justify-between text-xs font-medium text-desk-text-2">
          <span className="font-bangla">প্রমাণভিত্তিক দক্ষতা (Mastery)</span>
          <span className="font-bangla font-bold text-desk-ink">
            {toBanglaNumerals(masteryPct)}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={masteryPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-desk-track"
        >
          <div
            className="h-full rounded-full bg-desk-accent transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, masteryPct))}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-desk-muted">
          <span className="font-bangla">
            অবস্থা: <strong>{MASTERY_STATUS_LABELS[session.mastery.status]}</strong>
          </span>
          <span className="font-bangla">
            সঠিক: {toBanglaNumerals(session.state_metadata.questions_correct)}/
            {toBanglaNumerals(session.state_metadata.questions_attempted)}
          </span>
        </div>
      </div>

      {/* Prerequisite Status Badge */}
      <div className="flex items-center justify-between rounded-lg border border-desk-accent-line bg-desk-accent-soft px-3 py-2 text-xs">
        <span className="font-bangla font-medium text-desk-text-2">পূর্বজ্ঞান অবস্থা:</span>
        <span className="font-bangla font-semibold text-desk-accent-ink">
          {session.state_metadata.prerequisite_passed
            ? 'যাচাই সম্পন্ন ✓'
            : 'যাচাই/পুনরালোচনা চলমান'}
        </span>
      </div>

      {/* 7-Step Pedagogical Progression Rail */}
      <div>
        <h3 className="mb-3 font-bangla text-xs font-semibold uppercase tracking-wider text-desk-muted">
          ৭-ধাপের পাঠ পরিকল্পনা
        </h3>
        <ol className="space-y-2.5">
          {PEDAGOGICAL_RAIL_STEPS.map((item) => {
            const isCompleted = item.step < activeRailStep || session.current_stage === 'COMPLETED';
            const isCurrent = item.step === activeRailStep && session.current_stage !== 'COMPLETED';

            return (
              <li
                key={item.step}
                data-testid={`rail-step-${item.step}`}
                data-active={isCurrent ? 'true' : 'false'}
                className={`flex items-start gap-3 rounded-lg border p-2.5 transition-colors ${
                  isCurrent
                    ? 'border-desk-accent-line bg-desk-accent-soft text-desk-text'
                    : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 text-desk-text-2'
                      : 'border-desk-line-soft bg-desk-paper text-desk-muted'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bangla text-xs font-bold ${
                    isCurrent
                      ? 'bg-desk-ink text-white'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-desk-paper-3 text-desk-muted'
                  }`}
                >
                  {isCompleted ? '✓' : toBanglaNumerals(item.step)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bangla text-sm font-semibold leading-snug">
                    {item.titleBn}
                  </p>
                  <p className="text-xs text-desk-muted">{item.subtitleBn}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

