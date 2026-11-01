"use client";

import React, { useState } from "react";
import { MathBanglaText } from "@/components/math-bangla/MathBanglaText";
import { toBanglaNumerals } from "@/components/math-bangla/bangla-numerals";

interface CohortParticipant {
  id: number;
  pseudonym_bn: string;
  class_level: number;
  medium: string;
  has_submitted_poll: boolean;
  is_kicked: boolean;
}

interface RaiseHandItem {
  id: number;
  pseudonym_bn: string;
  question_summary_bn: string;
  pii_redacted: boolean;
  status: "queued" | "answered";
  queue_position: number;
  ai_or_teacher_response_bn?: string;
}

interface IndividualSideAssistance {
  id: number;
  student_question_bn: string;
  ai_side_explanation_bn: string;
  pii_redacted: boolean;
}

function scrubClientPreviewPii(text: string): { sanitized: string; piiRedacted: boolean } {
  const bdPhoneRegex = /(?:\+?880|0)1[3-9]\d{8}|(?:\+?৮৮০|০)১[৩-৯][০-৯]{8}/gu;
  const hasPhone = bdPhoneRegex.test(text);
  const sanitized = text.replace(bdPhoneRegex, "[REDACTED_BD_PHONE]");
  return { sanitized, piiRedacted: hasPhone };
}

export function GroupLearningWorkspace(): React.JSX.Element {
  const [joinCodeInput, setJoinCodeInput] = useState<string>("GRP-8B-2026");
  const [pseudonymInput, setPseudonymInput] = useState<string>("অভিযাত্রী-৩০৯");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"batch_mode" | "individual_assistance">(
    "batch_mode"
  );

  const [participants, setParticipants] = useState<CohortParticipant[]>([
    {
      id: 101,
      pseudonym_bn: "ধ্রুবতারা-১০১",
      class_level: 8,
      medium: "বাংলা মাধ্যম",
      has_submitted_poll: true,
      is_kicked: false,
    },
    {
      id: 204,
      pseudonym_bn: "অনুসন্ধানী-২০৪",
      class_level: 8,
      medium: "বাংলা মাধ্যম",
      has_submitted_poll: true,
      is_kicked: false,
    },
    {
      id: 309,
      pseudonym_bn: "অভিযাত্রী-৩০৯ (তুমি)",
      class_level: 8,
      medium: "বাংলা মাধ্যম",
      has_submitted_poll: false,
      is_kicked: false,
    },
  ]);

  // Batch Mode Broadcast Question Poll
  const [selectedOption, setSelectedOption] = useState<string>("B");
  const [pollRevealed, setPollRevealed] = useState<boolean>(false);

  // Individual Assistance Drawer State
  const [sideQuestionInput, setSideQuestionInput] = useState<string>(
    "স্যার, $(2x + 3y)^2$ এর মধ্যপদ কীভাবে $12xy$ হলো?"
  );
  const [sideAssistances, setSideAssistances] = useState<IndividualSideAssistance[]>([
    {
      id: 1,
      student_question_bn: "পক্ষান্তর করার সময় চিহ্ন কেন বদলায়?",
      ai_side_explanation_bn:
        "একক সহায়তা (যৌথ পাঠ বোর্ড অপরিবর্তিত রেখে): সমীকরণের উভয় পক্ষে একই সংখ্যা যোগ বা বিয়োগ করার সংক্ষিপ্ত রূপই হলো পক্ষান্তর বিধি। তাই $+5$ ডান পাশে গেলে $-5$ হয়।",
      pii_redacted: false,
    },
  ]);

  // FIFO Raise-Hand Queue State
  const [raiseHandInput, setRaiseHandInput] = useState<string>("");
  const [raiseHandQueue, setRaiseHandQueue] = useState<RaiseHandItem[]>([
    {
      id: 1,
      pseudonym_bn: "ধ্রুবতারা-১০১",
      question_summary_bn: "পক্ষান্তর বিধি কখন প্রয়োগ করতে হয়?",
      pii_redacted: false,
      status: "queued",
      queue_position: 1,
    },
    {
      id: 2,
      pseudonym_bn: "অনুসন্ধানী-২০৪",
      question_summary_bn: "ভগ্নাংশ যুক্ত সমীকরণ কীভাবে সরল করব?",
      pii_redacted: false,
      status: "queued",
      queue_position: 2,
    },
  ]);

  const activeParticipants = participants.filter((p) => !p.is_kicked);

  const handleJoinRoom = (): void => {
    if (joinCodeInput.trim() !== "GRP-8B-2026") {
      setJoinError("গ্রুপ স্টাডি রুমের আমন্ত্রণ কোড (Join Code) সঠিক নয়।");
      return;
    }
    setJoinError(null);
    if (activeParticipants.length >= 5) {
      setJoinError("এই গ্রুপ স্টাডি রুমে সর্বোচ্চ ৫ জন শিক্ষার্থীর কোটা পূর্ণ হয়েছে।");
      return;
    }
    const trimmed = pseudonymInput.trim();
    if (!trimmed) {
      return;
    }
    setParticipants((prev) => [
      ...prev,
      {
        id: Date.now(),
        pseudonym_bn: trimmed,
        class_level: 8,
        medium: "বাংলা মাধ্যম",
        has_submitted_poll: true,
        is_kicked: false,
      },
    ]);
    setPseudonymInput("");
  };

  const handleSubmitBroadcastPoll = (): void => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === 309 ? { ...p, has_submitted_poll: true } : p))
    );
    // Auto-reveal because all active participants have now submitted their individual responses!
    setPollRevealed(true);
  };

  const handleRequestSideAssistance = (): void => {
    const trimmed = sideQuestionInput.trim();
    if (!trimmed) {
      return;
    }
    const { sanitized, piiRedacted } = scrubClientPreviewPii(trimmed);
    setSideAssistances((prev) => [
      {
        id: Date.now(),
        student_question_bn: sanitized,
        ai_side_explanation_bn: `একক সহায়তা (যৌথ পাঠ বোর্ড অপরিবর্তিত রেখে): "${sanitized}" — এখানে প্রথম পদ $a = 2x$ এবং দ্বিতীয় পদ $b = 3y$ ধরলে মধ্যপদ $2ab = 2 \\times 2x \\times 3y = 12xy$ হয়।`,
        pii_redacted: piiRedacted,
      },
      ...prev,
    ]);
    setSideQuestionInput("");
  };

  const handleEnqueueRaiseHand = (): void => {
    const trimmed = raiseHandInput.trim();
    if (!trimmed) {
      return;
    }
    const { sanitized, piiRedacted } = scrubClientPreviewPii(trimmed);
    const queuedCount = raiseHandQueue.filter((i) => i.status === "queued").length;

    setRaiseHandQueue((prev) => [
      ...prev,
      {
        id: Date.now(),
        pseudonym_bn: "অভিযাত্রী-৩০৯",
        question_summary_bn: sanitized,
        pii_redacted: piiRedacted,
        status: "queued",
        queue_position: queuedCount + 1,
      },
    ]);
    setRaiseHandInput("");
  };

  const handleResolveNextInFifo = (): void => {
    setRaiseHandQueue((prev) => {
      const nextIdx = prev.findIndex((item) => item.status === "queued");
      if (nextIdx === -1) {
        return prev;
      }
      return prev.map((item, idx) =>
        idx === nextIdx
          ? {
              ...item,
              status: "answered",
              ai_or_teacher_response_bn:
                "যৌথ বোর্ডে উত্তর: সমান চিহ্নের এক পাশ থেকে অন্য পাশে পদ নিলে চিহ্ন পরিবর্তিত হয়।",
            }
          : item
      );
    });
  };

  const handleKickParticipant = (id: number): void => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_kicked: true } : p))
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Child Safety Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0F2942] px-3 py-1 text-xs font-bold text-white">
                আমন্ত্রণ কোড: GRP-8B-2026
              </span>
              <span className="rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-bold text-[#0D9488]">
                অষ্টম শ্রেণি • বাংলা মাধ্যম (সমশ্রেণি কোহর্ট)
              </span>
              <span
                data-testid="child-safety-policy-badge"
                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900"
              >
                PDPA ২০২৬ শিশু সুরক্ষা: ১-অন-১ চ্যাট বন্ধ • PII Scrubber সক্রিয়
              </span>
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold text-[#0F2942]">
              স্মল-গ্রুপ স্টাডি ও ব্যাচ টিউটরিং রুম (৩–৫ জন সহপাঠী)
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ • শিখনফল: দ্বিপদী রাশির বর্গ ও সরল সমীকরণ
            </p>
          </div>

          <div
            data-testid="active-cohort-count-badge"
            className="rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-3 text-right"
          >
            <p className="text-xs font-semibold text-slate-600">সক্রিয় সহপাঠী কোহর্ট</p>
            <p className="font-heading text-xl font-bold text-[#0D9488]">
              {toBanglaNumerals(activeParticipants.length)} / {toBanglaNumerals(5)} জন
            </p>
          </div>
        </div>

        {/* Invite-Only Join Bar & Active Participant Roster */}
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-5">
            <p className="text-xs font-bold text-slate-700">
              আমন্ত্রণ কোড দিয়ে সহপাঠী যুক্ত করুন (শুধুমাত্র অষ্টম শ্রেণি):
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                aria-label="আমন্ত্রণ কোড"
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="GRP-8B-2026"
                className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
              />
              <input
                aria-label="ছদ্মনাম"
                type="text"
                value={pseudonymInput}
                onChange={(e) => setPseudonymInput(e.target.value)}
                placeholder="ছদ্মনাম (যেমন: অভিযাত্রী-৩০৯)"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                data-testid="join-cohort-room-btn"
                onClick={handleJoinRoom}
                className="rounded-xl bg-[#0F2942] px-3.5 py-1.5 text-xs font-bold text-white"
              >
                রুমে যুক্ত হও
              </button>
            </div>
            {joinError && (
              <p
                data-testid="join-cohort-error"
                className="text-xs font-semibold text-rose-600"
              >
                {joinError}
              </p>
            )}
          </div>

          <div className="lg:col-span-7">
            <p className="mb-2 text-xs font-bold text-slate-700">
              রুমের সহপাঠী তালিকা (ছদ্মনাম ও উত্তর স্ট্যাটাস):
            </p>
            <div className="flex flex-wrap gap-2">
              {activeParticipants.map((participant) => (
                <div
                  key={participant.id}
                  data-testid={`cohort-participant-${participant.id}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                >
                  <span className="font-bold text-[#0F2942]">
                    {participant.pseudonym_bn}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      participant.has_submitted_poll
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {participant.has_submitted_poll ? "উত্তর জমা দিয়েছে" : "উত্তর লিখছে..."}
                  </span>
                  {participant.id !== 309 && (
                    <button
                      type="button"
                      data-testid={`kick-participant-${participant.id}`}
                      onClick={() => handleKickParticipant(participant.id)}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      অব্যাহতি
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Teaching Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            data-testid="switch-batch-mode-btn"
            onClick={() => setActiveMode("batch_mode")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeMode === "batch_mode"
                ? "bg-[#0F2942] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            ১. ব্যাচ মোড (Shared Group Board & Broadcast Poll)
          </button>
          <button
            type="button"
            data-testid="switch-individual-mode-btn"
            onClick={() => setActiveMode("individual_assistance")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeMode === "individual_assistance"
                ? "bg-[#0D9488] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            ২. একক সহায়তা মোড (Targeted Side-Explanation)
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-600">
          পাঠের ধাপ: মূল ধারণা ব্যাখ্যা → যৌথ প্রশ্নোত্তর (Broadcast Poll) → হাত তোলার কিউ (FIFO)
        </span>
      </div>

      {/* Main Two-Column Group Learning Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 Columns: Shared Batch Board & Broadcast Poll OR Individual Side-Assistance */}
        <div className="space-y-6 lg:col-span-7">
          {/* Shared NCTB Lesson Board (Always visible so shared state is never derailed) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-[#0F2942]/10 px-3 py-1 text-xs font-bold text-[#0F2942]">
                যৌথ পাঠ বোর্ড (Shared Cohort Lesson Board)
              </span>
              <span className="text-xs text-slate-500">
                NCTB অষ্টম শ্রেণি গণিত • অধ্যায় ৪
              </span>
            </div>
            <h2 className="mb-2 font-heading text-lg font-bold text-[#0F2942]">
              দ্বিপদী রাশির বর্গের সূত্র ও পক্ষান্তর বিধি
            </h2>
            <MathBanglaText
              content="দুইটি পদের যোগফলের বর্গ নির্ণয়ের সূত্র হলো: $$(a + b)^2 = a^2 + 2ab + b^2$$ এখানে মধ্যপদটি হলো $2ab$, অর্থাৎ প্রথম ও দ্বিতীয় পদের গুণফলের দ্বিগুণ।"
              variant="lesson-body"
            />
          </div>

          {activeMode === "batch_mode" ? (
            /* Batch Mode: Group Broadcast Question where answers are hidden until everyone submits */
            <div
              data-testid="group-broadcast-poll-card"
              className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  গ্রুপ ব্রডকাস্ট প্রশ্ন (সবাই উত্তর দেওয়ার পর সঠিক উত্তর উন্মুক্ত হবে)
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  জমা পড়েছে:{" "}
                  {toBanglaNumerals(
                    activeParticipants.filter((p) => p.has_submitted_poll).length
                  )}{" "}
                  / {toBanglaNumerals(activeParticipants.length)} জন
                </span>
              </div>

              <div className="mt-3">
                <MathBanglaText
                  content="যৌথ প্রশ্ন: $(2x + 3y)^2$ এর বিস্তৃতিতে মধ্যপদ ($2ab$) নিচের কোনটি?"
                  variant="question"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  { key: "A", label: "$6xy$" },
                  { key: "B", label: "$12xy$" },
                  { key: "C", label: "$4x^2$" },
                  { key: "D", label: "$9y^2$" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    data-testid={`broadcast-option-${opt.key}`}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                      selectedOption === opt.key
                        ? "border-[#0D9488] bg-teal-50 font-bold text-[#0F2942]"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold shadow-sm">
                      {opt.key}
                    </span>
                    <MathBanglaText content={opt.label} variant="compact" />
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  data-testid="submit-broadcast-poll-btn"
                  onClick={handleSubmitBroadcastPoll}
                  className="rounded-xl bg-[#0F2942] px-4 py-2 text-xs font-bold text-white"
                >
                  আমার একক উত্তর জমা দাও
                </button>

                {pollRevealed && (
                  <span
                    data-testid="broadcast-reveal-badge"
                    className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-900"
                  >
                    সকল সহপাঠীর উত্তর জমা সম্পন্ন! সঠিক উত্তর: B (12xy) • কোহর্ট সঠিকতা: ১০০%
                  </span>
                )}
              </div>

              {pollRevealed && (
                <div
                  data-testid="broadcast-explanation-box"
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"
                >
                  <MathBanglaText
                    content="ব্যাখ্যা: এখানে $a = 2x$ এবং $b = 3y$। সুতরাং মধ্যপদ $2ab = 2 \times 2x \times 3y = 12xy$।"
                    variant="compact"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Individual Assistance Mode: Targeted side-explanation without derailing shared group state */
            <div
              data-testid="individual-assistance-drawer"
              className="rounded-2xl border border-[#0D9488] bg-white p-6 shadow-sm"
            >
              <span className="rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-bold text-[#0D9488]">
                ব্যক্তিগত সহায়তা মোড (যৌথ গ্রুপ বোর্ড অপরিবর্তিত থাকে)
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-[#0F2942]">
                এআই গৃহশিক্ষকের একক সাইড-ব্যাখ্যা (Side-Explanation)
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                কোনো ধাপ বুঝতে সমস্যা হলে এখানে প্রশ্ন করো। মূল গ্রুপ বোর্ডের পাঠ থামবে না, শুধুমাত্র তোমার জন্য আলাদাভাবে সহজ ব্যাখ্যা দেওয়া হবে।
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  aria-label="একক সহায়তার প্রশ্ন"
                  type="text"
                  value={sideQuestionInput}
                  onChange={(e) => setSideQuestionInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  placeholder="যেমন: পক্ষান্তর বিধি আরেকটু সহজ করে বোঝাও..."
                />
                <button
                  type="button"
                  data-testid="request-side-assistance-btn"
                  onClick={handleRequestSideAssistance}
                  className="rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-bold text-white"
                >
                  একক ব্যাখ্যা চাও
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {sideAssistances.map((item) => (
                  <div
                    key={item.id}
                    data-testid="side-assistance-item"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs"
                  >
                    <p className="font-bold text-[#0F2942]">
                      তোমার প্রশ্ন: {item.student_question_bn}
                    </p>
                    <div className="mt-1.5 text-slate-700">
                      <MathBanglaText
                        content={item.ai_side_explanation_bn}
                        variant="compact"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Real-Time FIFO Raise-Hand Queue */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-900">
                  Laravel Reverb রিয়েল-টাইম কিউ
                </span>
                <h2 className="mt-2 font-heading text-lg font-bold text-[#0F2942]">
                  হাত তোলার কিউ (FIFO Raise-Hand Queue)
                </h2>
              </div>
              <button
                type="button"
                data-testid="resolve-fifo-hand-btn"
                onClick={handleResolveNextInFifo}
                className="rounded-xl bg-[#0D9488] px-3.5 py-2 text-xs font-bold text-white"
              >
                পরবর্তী প্রশ্নের উত্তর দিন (FIFO)
              </button>
            </div>

            {/* Enqueue New Raise Hand */}
            <div className="mt-4 flex gap-2">
              <input
                aria-label="হাত তোলার প্রশ্ন"
                type="text"
                value={raiseHandInput}
                onChange={(e) => setRaiseHandInput(e.target.value)}
                placeholder="তোমার প্রশ্ন লেখো (ফোন নম্বর স্বয়ংক্রিয়ভাবে গোপন হবে)..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
              <button
                type="button"
                data-testid="enqueue-raise-hand-btn"
                onClick={handleEnqueueRaiseHand}
                className="rounded-xl bg-[#0F2942] px-3.5 py-2 text-xs font-bold text-white"
              >
                হাত তোলো
              </button>
            </div>

            {/* Ordered Queue Items */}
            <div className="mt-4 space-y-3">
              {raiseHandQueue.map((item, idx) => (
                <div
                  key={item.id}
                  data-testid={`raise-hand-item-${idx + 1}`}
                  className={`rounded-xl border p-3.5 text-xs ${
                    item.status === "answered"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : idx ===
                          raiseHandQueue.findIndex((q) => q.status === "queued")
                        ? "border-[#0D9488] bg-teal-50/40"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#0F2942]">
                      #{toBanglaNumerals(idx + 1)} {item.pseudonym_bn}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.pii_redacted && (
                        <span
                          data-testid="pii-redacted-badge"
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900"
                        >
                          PII গোপনকৃত
                        </span>
                      )}
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 font-semibold text-slate-800">
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-slate-800">{item.question_summary_bn}</p>
                  {item.ai_or_teacher_response_bn && (
                    <p className="mt-2 rounded-lg bg-white p-2 font-semibold text-emerald-900">
                      {item.ai_or_teacher_response_bn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

