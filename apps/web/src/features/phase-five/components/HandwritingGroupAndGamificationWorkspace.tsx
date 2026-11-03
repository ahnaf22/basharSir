"use client";

import React, { useState } from "react";
import { toBanglaNumerals } from "@/components/math-bangla/bangla-numerals";

export function HandwritingGroupAndGamificationWorkspace(): React.JSX.Element {
  const [ocrStatus, setOcrStatus] = useState<
    "auto_graded" | "escalated_to_human" | "human_reviewed"
  >("escalated_to_human");
  const [awardedMarks, setAwardedMarks] = useState<number>(7.0);
  const [overrideInput, setOverrideInput] = useState<string>("8.5");
  const [raiseHandQueue, setRaiseHandQueue] = useState<
    { id: number; pseudonym_bn: string; question_bn: string; status: string }[]
  >([
    {
      id: 1,
      pseudonym_bn: "ধ্রুবতারা-১০১",
      question_bn: "পক্ষান্তর বিধি কখন প্রয়োগ করতে হয়?",
      status: "queued",
    },
    {
      id: 2,
      pseudonym_bn: "অনুসন্ধানী-২০৪",
      question_bn: "ভগ্নাংশ যুক্ত সমীকরণ কীভাবে সরল করব?",
      status: "queued",
    },
  ]);

  const handleReviewerOverride = (): void => {
    const parsed = parseFloat(overrideInput);
    if (!Number.isNaN(parsed)) {
      setAwardedMarks(parsed);
      setOcrStatus("human_reviewed");
    }
  };

  const handleResolveNextHand = (): void => {
    setRaiseHandQueue((prev) => {
      const firstQueuedIdx = prev.findIndex((item) => item.status === "queued");
      if (firstQueuedIdx === -1) {
        return prev;
      }
      return prev.map((item, idx) =>
        idx === firstQueuedIdx ? { ...item, status: "answered" } : item
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Handwritten Script OCR & Reviewer Override (Chunk 5.3) */}
      <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-desk-accent/10 px-3 py-1 text-xs font-bold text-desk-accent-ink">
              মাল্টিমোডাল বাংলা/গণিত ওসিআর (Dual Confidence Gate: OCR ≥ ৮৫% • Rubric ≥ ৮০%)
            </span>
            <h2 className="mt-2 font-heading text-xl font-bold text-desk-ink">
              হাতের লেখার উত্তরপত্র স্ক্যানার ও শিক্ষক রিভিউ ওভাররাইড
            </h2>
          </div>
          <span
            data-testid="script-review-status-badge"
            className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900"
          >
            স্ট্যাটাস: {ocrStatus} • নম্বর: {toBanglaNumerals(awardedMarks)} / ১০
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-desk-line bg-desk-paper-2 p-4">
            <p className="text-xs font-bold text-desk-muted">
              ওসিআর থেকে রূপান্তরিত পাঠ্য (OCR Extracted Text)
            </p>
            <p className="mt-2 text-sm text-desk-text">
              প্রদত্ত রাশি হতে বর্গের সূত্র প্রয়োগ করে ধাপে ধাপে সমাধান নির্ণয় করা হলো।
            </p>
            <p className="mt-2 text-xs text-desk-muted">
              OCR Confidence: ৭৮% (মানব পরীক্ষকের রিভিউ প্রয়োজন)
            </p>
          </div>

          <div className="rounded-xl border border-desk-line bg-desk-paper-2 p-4">
            <label className="block text-xs font-bold text-desk-text-2">
              মানব পরীক্ষকের সংশোধিত নম্বর (Reviewer Override Marks):
              <input
                aria-label="সংশোধিত নম্বর"
                type="text"
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-desk-line-strong bg-desk-paper px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="button"
              data-testid="apply-reviewer-override-btn"
              onClick={handleReviewerOverride}
              className="mt-3 rounded-xl bg-desk-ink px-4 py-2 text-xs font-bold text-white"
            >
              সংশোধিত মূল্যায়ন অনুমোদন করুন
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Small-Group Cohort Room & FIFO Raise-Hand Queue (Chunk 5.4) */}
      <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-desk-ink">
              স্মল-গ্রুপ স্টাডি রুম (৩–৫ জন শিক্ষার্থী) ও হাত তোলার কিউ (FIFO Raise-Hand Queue)
            </h2>
          </div>
          <button
            type="button"
            data-testid="resolve-fifo-hand-btn"
            onClick={handleResolveNextHand}
            className="rounded-xl bg-desk-accent px-4 py-2 text-xs font-bold text-white"
          >
            পরবর্তী প্রশ্নের উত্তর দিন (Resolve FIFO)
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {raiseHandQueue.map((item, idx) => (
            <div
              key={item.id}
              data-testid={`raise-hand-item-${item.id}`}
              className="flex items-center justify-between rounded-xl border border-desk-line-soft bg-desk-paper-2 p-3.5 text-xs"
            >
              <div>
                <span className="font-bold text-desk-ink">
                  #{toBanglaNumerals(idx + 1)} {item.pseudonym_bn}:
                </span>{" "}
                <span>{item.question_bn}</span>
              </div>
              <span className="rounded-full bg-desk-track px-2.5 py-0.5 font-semibold text-desk-text">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Ethical Gamification, Streak Freeze & Pseudonymous Leaderboard (Chunk 5.5) */}
      <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-desk-ink">
          নৈতিক গেমিফিকেশন, স্ট্রিক ফ্রিজ ও ছদ্মনাম লিডারবোর্ড (Ethical Gamification)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            data-testid="gamification-streak-card"
            className="rounded-xl border border-desk-accent-line bg-desk-accent-soft p-4"
          >
            <p className="text-xs font-semibold text-desk-muted">ধারাবাহিক স্ট্রিক</p>
            <p className="mt-1 font-heading text-2xl font-bold text-desk-accent-ink">
              {toBanglaNumerals(3)} দিন (১টি স্ট্রিক ফ্রিজ সক্রিয়)
            </p>
          </div>
          <div className="rounded-xl border border-desk-line bg-desk-paper-2 p-4">
            <p className="text-xs font-semibold text-desk-muted">অর্জিত এক্সপি (XP)</p>
            <p className="mt-1 font-heading text-2xl font-bold text-desk-ink">
              {toBanglaNumerals(95)} XP
            </p>
          </div>
          <div className="rounded-xl border border-desk-line bg-desk-paper-2 p-4">
            <p className="text-xs font-semibold text-desk-muted">
              অষ্টম শ্রেণি লিডারবোর্ড (ছদ্মনাম)
            </p>
            <p
              data-testid="pseudonymous-leaderboard-top"
              className="mt-1 text-sm font-bold text-emerald-800"
            >
              #১ শিক্ষার্থী-5001 (৯৫ XP)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

