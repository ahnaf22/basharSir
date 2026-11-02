"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, PenTool, CheckCircle2, ArrowRight, RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LearningFromMistakesSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"before" | "after">("after");

  return (
    <section className="border-t border-[#E7E2D8] bg-[#F4EFE6]/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Emotionally Grounded Copy */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900">
              <Heart className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>ভুল থেকে Level Up!</span>
            </div>

            <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
              ভুল হইছে? <br />
              <span className="text-[#FF5C35]">সমস্যা নাই, আবার হবে!</span>
            </h2>

            <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
              ভুল করা মানেই তুমি পারো না, এমন নয়। ভুল থেকেই শেখা শুরু হয়। তোমার Tutor বুঝবে কোথায় সমস্যা হচ্ছে এবং আবার বুঝিয়ে দেবে।
            </p>

            <div className="rounded-2xl border border-[#E7E2D8] bg-white p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-base">
                  💡
                </span>
                <div>
                  <h4 className="font-heading text-base font-bold text-[#0B3B2C]">
                    “এই তো! মাথায় ঢুকছে!”
                  </h4>
                  <p className="mt-0.5 font-bangla text-xs leading-relaxed text-[#52635B]">
                    অংকের কোনো লাইনে চিহ্নের গণ্ডগোল হলে বা বিজ্ঞানের সংকেতে ভুল হলে স্যার বকা দেন না—ভুলটাকে চিহ্নিত করে বলেন: “আরেকবার দেখ তো, মাইনাসে মাইনাসে কী হয়?”
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bangla text-[#52635B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#0B3B2C] shrink-0" />
                <span>স্কুলের রুলটানা খাতায় অংক করার সুযোগ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#0B3B2C] shrink-0" />
                <span>ছবি তুললেই লাইন-বাই-লাইন মূল্যায়ন</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/scripts">
                <Button
                  size="md"
                  className="bg-[#0B3B2C] font-bangla font-bold text-white hover:bg-[#134E39]"
                >
                  <PenTool className="mr-2 h-4 w-4 text-[#FF5C35]" />
                  হাতের খাতা আপলোড ফিচার দেখো
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Notebook Comparison Card */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-xl">
              {/* Tab Selector */}
              <div className="flex border-b border-[#E7E2D8] bg-[#FAF7F2] p-1.5">
                <button
                  onClick={() => setActiveTab("before")}
                  className={`flex-1 rounded-2xl py-2.5 font-heading text-xs font-bold transition-all ${
                    activeTab === "before"
                      ? "bg-white text-rose-700 shadow-2xs"
                      : "text-[#52635B] hover:text-[#18241E]"
                  }`}
                >
                  ১. প্রথম চেষ্টা (যেখানে ভুল হয়েছিল)
                </button>
                <button
                  onClick={() => setActiveTab("after")}
                  className={`flex-1 rounded-2xl py-2.5 font-heading text-xs font-bold transition-all ${
                    activeTab === "after"
                      ? "bg-[#0B3B2C] text-white shadow-2xs"
                      : "text-[#52635B] hover:text-[#18241E]"
                  }`}
                >
                  ২. স্যারের হিন্টের পর (Level Up!)
                </button>
              </div>

              {/* Card Content based on Active Tab */}
              <div className="p-6">
                {activeTab === "before" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                      <span className="text-xs font-bold text-rose-800">
                        ছাত্রের খসড়া উত্তর:
                      </span>
                      <p className="mt-1 font-mono text-base font-bold text-slate-800">
                        (2x + 3y)² = 2x² + 6xy + 3y²
                      </p>
                      <div className="mt-3 border-t border-rose-200/80 pt-2 text-xs text-rose-900 font-bangla">
                        <span className="font-bold">বাশার স্যারের নোট:</span> “লক্ষ্য করো, $(2x)^2$ করলে সহগ ২-এরও বর্গ করতে হবে। $2^2 = 4$ হবে। আর মধ্যপদ $2ab = 2 \times 2x \times 3y = 12xy$।”
                      </div>
                    </div>
                    <p className="text-center text-xs text-[#52635B] font-bangla">
                      বকা নেই, কোনো লজ্জা নেই। এবার ডানপাশের ট্যাবে ক্লিক করে দেখো কী হলো &rarr;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">
                          সংশোধিত নির্ভুল উত্তর:
                        </span>
                        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                          ১০ / ১০
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-base font-bold text-slate-800">
                        (2x + 3y)² = 4x² + 12xy + 9y²
                      </p>
                      <div className="mt-3 border-t border-emerald-200/80 pt-2 text-xs text-emerald-900 font-bangla flex items-center justify-between">
                        <span>“অসাধারণ! এই তো মাথায় ঢুকছে! চ্যাপ্টার ক্লিয়ার, বস!”</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                    </div>
                    {/* Real Notebook Illustration */}
                    <div className="rounded-2xl border border-[#E7E2D8] overflow-hidden">
                      <Image
                        src="/images/handwritten-script-sample.svg"
                        alt="শিক্ষার্থীর খাতা মূল্যায়নের বাস্তব নমুনা"
                        width={500}
                        height={260}
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

