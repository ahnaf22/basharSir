"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  User,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DialogueMessage {
  speaker: "tutor" | "student";
  text: string;
  badge?: string;
  hint?: string;
}

const DIALOGUE_STEPS: DialogueMessage[] = [
  {
    speaker: "tutor",
    text: "চলো দেখি, 2x + 5 = 15 হলে x-এর মান কত?",
    badge: "মূল প্রশ্ন",
  },
  {
    speaker: "student",
    text: "10?",
  },
  {
    speaker: "tutor",
    text: "একটু চিন্তা করো! প্রথমে দুই পাশ থেকে 5 বাদ দিলে কী থাকে?",
    badge: "সহায়ক ইঙ্গিত",
    hint: "বাম পাশের +5 সরাতে উভয় পাশ থেকে 5 বিয়োগ করো।",
  },
  {
    speaker: "student",
    text: "2x = 10!",
  },
  {
    speaker: "tutor",
    text: "এই তো! মাথায় ঢুকছে! এবার দুই পাশকে 2 দিয়ে ভাগ করো।",
    badge: "উৎসাহ ও পরবর্তী ধাপ",
  },
  {
    speaker: "student",
    text: "x = 5!",
  },
  {
    speaker: "tutor",
    text: "একদম ঠিক! চ্যাপ্টার ক্লিয়ার, বস!",
    badge: "সাফল্য 🎉",
  },
];

export function InteractiveTutorSection(): React.JSX.Element {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(DIALOGUE_STEPS.length - 1);
  const [showHint, setShowHint] = useState<boolean>(true);

  const nextStep = () => {
    setActiveStepIndex((prev) => (prev < DIALOGUE_STEPS.length - 1 ? prev + 1 : prev));
  };

  const prevStep = () => {
    setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const resetSteps = () => {
    setActiveStepIndex(0);
  };

  return (
    <section id="features" className="bg-[#FAF7F2] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Context & Editorial Copy */}
          <div className="space-y-6 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF5C35]" />
              <span>ইন্টারঅ্যাক্টিভ এআই গৃহশিক্ষক</span>
            </div>

            <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
              প্যাঁচ যতই থাকুক, <br />
              <span className="text-[#FF5C35]">পড়া হবে!</span>
            </h2>

            <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
              বইয়ের কঠিন অঙ্ক হোক কিংবা বিজ্ঞানের জটিল কোনো বিষয়, তোমার AI Tutor ধাপে ধাপে বুঝিয়ে দেবে।
            </p>

            <div className="space-y-3 font-bangla text-sm text-[#18241E]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>সরাসরি উত্তর বলে না দিয়ে নিজে ভাবার সুযোগ দেয়</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>ভুল হলে কোথায় আটকাচ্ছে বুঝে সহজ ভাষায় হিন্ট দেয়</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>সঠিক উত্তরে দেয় বাস্তব উৎসাহ: “চ্যাপ্টার ক্লিয়ার, বস!”</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/tutor">
                <Button
                  size="lg"
                  className="bg-[#0B3B2C] font-bangla text-base font-bold text-white shadow-md hover:bg-[#134E39]"
                >
                  লাইভ ক্লাসে ঢুকে দেখো
                  <ArrowRight className="ml-2 h-4 w-4 text-[#FF5C35]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic Interactive Tutor Interface */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-xl ring-1 ring-black/5">
              {/* Tutor Window Header */}
              <div className="flex items-center justify-between border-b border-[#E7E2D8] bg-[#F4EFE6] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B3B2C] text-white">
                    <BrainCircuit className="h-5 w-5 text-[#FF5C35]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#0B3B2C]">
                      বাশার স্যার (AI Tutor)
                    </h3>
                    <p className="text-[11px] font-medium text-[#52635B]">
                      ৮ম শ্রেণি গণিত · সরল সহসমীকরণ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetSteps}
                    title="শুরু থেকে আবার দেখো"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C4] bg-white px-2.5 py-1 text-xs font-semibold text-[#52635B] hover:bg-[#FAF7F2]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">রিসেট</span>
                  </button>
                  <span className="rounded-full bg-[#0B3B2C]/10 px-2.5 py-0.5 text-xs font-bold text-[#0B3B2C]">
                    ধাপ {activeStepIndex + 1}/{DIALOGUE_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Chat Stream Window */}
              <div className="space-y-3.5 p-5 min-h-[360px] max-h-[440px] overflow-y-auto bg-[#FAF7F2]/40">
                {DIALOGUE_STEPS.slice(0, activeStepIndex + 1).map((msg, idx) => {
                  const isTutor = msg.speaker === "tutor";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isTutor ? "items-start" : "items-end"} transition-all duration-300`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {isTutor && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B3B2C] text-white text-xs">
                            AI
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-4 text-sm leading-[1.7] ${
                            isTutor
                              ? "bg-white border border-[#E7E2D8] text-[#18241E] shadow-2xs"
                              : "bg-[#0B3B2C] text-white shadow-2xs font-medium"
                          }`}
                        >
                          {msg.badge && (
                            <span className="mb-1 inline-block rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-bold text-[#0B3B2C]">
                              {msg.badge}
                            </span>
                          )}
                          <p className="font-bangla font-semibold text-base sm:text-lg">
                            {msg.text}
                          </p>
                          {msg.hint && showHint && (
                            <div className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200/60 font-bangla">
                              💡 {msg.hint}
                            </div>
                          )}
                        </div>
                        {!isTutor && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF5C35] text-white text-xs">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Player Controls */}
              <div className="flex items-center justify-between border-t border-[#E7E2D8] bg-white p-4">
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStepIndex === 0}
                    onClick={prevStep}
                    className="rounded-xl border border-[#D8D2C4] px-3 py-1.5 text-xs font-bold text-[#18241E] disabled:opacity-40 hover:bg-[#FAF7F2]"
                  >
                    আগের ধাপ
                  </button>
                  <button
                    disabled={activeStepIndex === DIALOGUE_STEPS.length - 1}
                    onClick={nextStep}
                    className="rounded-xl bg-[#0B3B2C] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#134E39]"
                  >
                    পরের ধাপ দেখুন &rarr;
                  </button>
                </div>

                <div className="text-right">
                  {activeStepIndex === DIALOGUE_STEPS.length - 1 ? (
                    <span className="font-heading text-xs font-bold text-[#0B3B2C]">
                      ✅ পুরো অংক সমাধান সম্পন্ন!
                    </span>
                  ) : (
                    <span className="font-bangla text-xs text-[#52635B]">
                      ক্লিক করে দেখো কীভাবে বুঝায়
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

