"use client";

import React from "react";
import Link from "next/link";
import { FileCheck2, Clock, CheckCircle2, ArrowRight, PenTool, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ExaminationSection(): React.JSX.Element {
  return (
    <section className="border-t border-[#E7E2D8] bg-[#F4EFE6]/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Copy & Highlights */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C]">
              <FileCheck2 className="h-3.5 w-3.5 text-[#FF5C35]" />
              <span>বোর্ড পরীক্ষার বাস্তব আদল</span>
            </div>

            <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
              পরীক্ষার প্রস্তুতি? <br />
              <span className="text-[#FF5C35]">এবার সিরিয়াসলি হবে!</span>
            </h2>

            <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
              নিজের পছন্দের চ্যাপ্টার বেছে নাও, পরীক্ষা দাও, সময়ের মধ্যে উত্তর লেখো আর জেনে নাও কোথায় আরও প্র্যাকটিস দরকার।
            </p>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4">
                <Clock className="h-5 w-5 text-[#0B3B2C]" />
                <h4 className="mt-2 font-heading text-sm font-bold text-[#0B3B2C]">
                  টাইমারযুক্ত মডেল টেস্ট
                </h4>
                <p className="font-bangla text-xs text-[#52635B]">
                  ঘড়ি ধরে পরীক্ষার অভ্যাস তৈরি হয়, যাতে বোর্ড পরীক্ষায় সময়ের টানাটানি না হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4">
                <PenTool className="h-5 w-5 text-[#FF5C35]" />
                <h4 className="mt-2 font-heading text-sm font-bold text-[#0B3B2C]">
                  হাতের লেখার খাতা আপলোড
                </h4>
                <p className="font-bangla text-xs text-[#52635B]">
                  সৃজনশীল বা জ্যামিতির চিত্র খাতায় এঁকে ছবি জমা দাও—ধাপ অনুযায়ী নম্বর পাবে।
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4">
                <BarChart3 className="h-5 w-5 text-[#F59E0B]" />
                <h4 className="mt-2 font-heading text-sm font-bold text-[#0B3B2C]">
                  দুর্বলতা চিহ্নিতকরণ
                </h4>
                <p className="font-bangla text-xs text-[#52635B]">
                  কোন চ্যাপ্টারে নম্বর কাটা গেল তা সুনির্দিষ্টভাবে চিহ্নিত করে রিভিশন প্ল্যান।
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h4 className="mt-2 font-heading text-sm font-bold text-[#0B3B2C]">
                  ধাপভিত্তিক রুব্রিক মার্কিং
                </h4>
                <p className="font-bangla text-xs text-[#52635B]">
                  অংকের শেষ উত্তর ভুল হলেও ঠিক ধাপগুলোর জন্য আংশিক নম্বর নিশ্চিত।
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/exams">
                <Button size="lg" className="bg-[#0B3B2C] font-bangla font-bold text-white hover:bg-[#134E39]">
                  একটি মডেল টেস্ট দিয়ে দেখো
                  <ArrowRight className="ml-2 h-4 w-4 text-[#FF5C35]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic Exam Interface Preview */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-xl">
              {/* Exam Window Header */}
              <div className="flex items-center justify-between border-b border-[#E7E2D8] bg-[#FAF7F2] p-4">
                <div>
                  <span className="font-heading text-xs font-bold text-[#0B3B2C]">
                    অষ্টম শ্রেণি গণিত · অধ্যায় ৪ মডেল টেস্ট
                  </span>
                  <p className="text-[11px] text-[#52635B]">মোট নম্বর: ২০ · পূর্ণমান ২০</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1 font-mono text-xs font-bold text-red-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span>১৪:৩২ মিনিট বাকি</span>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#FF5C35]">
                    প্রশ্ন ৩ / ১০ (MCQ ও সংক্ষিপ্ত)
                  </span>
                  <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[11px] font-semibold text-[#0B3B2C]">
                    মান: ২
                  </span>
                </div>

                <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAF7F2]/60 p-4">
                  <p className="font-bangla text-sm font-bold text-[#18241E] leading-relaxed">
                    $(3x - 4y)^2$ এর বিস্তৃতিতে মধ্যপদটি কত হবে?
                  </p>
                </div>

                {/* Multiple Options */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E7E2D8] bg-white p-3 text-xs font-bold text-[#18241E] hover:border-[#0B3B2C]">
                    (ক) $12xy$
                  </div>
                  <div className="rounded-xl border-2 border-[#0B3B2C] bg-emerald-50/60 p-3 text-xs font-bold text-[#0B3B2C] flex items-center justify-between">
                    <span>(খ) $-24xy$</span>
                    <span className="text-[10px] text-emerald-800 font-bold">নির্বাচিত ✓</span>
                  </div>
                  <div className="rounded-xl border border-[#E7E2D8] bg-white p-3 text-xs font-bold text-[#18241E] hover:border-[#0B3B2C]">
                    (গ) $+24xy$
                  </div>
                  <div className="rounded-xl border border-[#E7E2D8] bg-white p-3 text-xs font-bold text-[#18241E] hover:border-[#0B3B2C]">
                    (ঘ) $-12xy$
                  </div>
                </div>

                {/* Question Palette Indicator */}
                <div className="border-t border-[#E7E2D8] pt-3">
                  <p className="text-[11px] font-semibold text-[#52635B] mb-2">
                    প্রশ্ন প্যালেট:
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <span
                        key={num}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          num === 3
                            ? "bg-[#0B3B2C] text-white"
                            : num < 3
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#F4EFE6] text-[#52635B]"
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

