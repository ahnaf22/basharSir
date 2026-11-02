"use client";

import React from "react";
import Link from "next/link";
import { Flame, Clock, BookOpen, TrendingUp, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ProgressSection(): React.JSX.Element {
  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C]">
            <TrendingUp className="h-3.5 w-3.5 text-[#0B3B2C]" />
            ধারাবাহিক অগ্রগতি ট্র্যাকিং
          </span>
          <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
            পড়ো একটু, <span className="text-[#FF5C35]">এগিয়ে যাও অনেকটা!</span>
          </h2>
          <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
            প্রতিদিনের ছোট ছোট শেখাই তোমাকে নিয়ে যাবে বড় সাফল্যের দিকে। নিজের পড়ার অগ্রগতি নিজেই দেখো।
          </p>
        </div>

        {/* Dashboard Preview Composition */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-xl sm:p-8 lg:p-10">
          {/* Top 4 Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Streak */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-amber-900">
                  ধারাবাহিক স্ট্রিক
                </span>
                <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <p className="mt-3 font-heading text-3xl font-black text-[#0B3B2C]">
                ৩ দিন <span className="text-xs font-normal text-amber-800">🔥 চালু আছে</span>
              </p>
              <p className="mt-1 font-bangla text-xs text-[#52635B]">
                ১টি স্ট্রিক ফ্রিজ অবশিষ্ট
              </p>
            </div>

            {/* Metric 2: Study Time */}
            <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-teal-900">
                  আজকের পড়ার সময়
                </span>
                <Clock className="h-5 w-5 text-[#0B3B2C]" />
              </div>
              <p className="mt-3 font-heading text-3xl font-black text-[#0B3B2C]">
                ৪৫ মিনিট
              </p>
              <p className="mt-1 font-bangla text-xs text-[#52635B]">
                দৈনিক লক্ষ্যমাত্রা: ৪৫ মিনিট (১০০%)
              </p>
            </div>

            {/* Metric 3: Chapters Completed */}
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-blue-900">
                  সম্পন্ন অধ্যায়
                </span>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-3 font-heading text-3xl font-black text-[#0B3B2C]">
                ৬টি অধ্যায়
              </p>
              <p className="mt-1 font-bangla text-xs text-[#52635B]">
                বীজগণিত ও পরমাণুর গঠন ক্লিয়ার
              </p>
            </div>

            {/* Metric 4: Average Score */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-emerald-900">
                  মডেল টেস্ট স্কোর
                </span>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-3 font-heading text-3xl font-black text-[#0B3B2C]">
                ৮২%
              </p>
              <p className="mt-1 font-bangla text-xs text-[#52635B]">
                গত সপ্তাহের চেয়ে ১২% উন্নতি
              </p>
            </div>
          </div>

          {/* Lower Two Columns: Subject Progress Bars & Today's Plan */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Subject Mastery Bars */}
            <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAF7F2] p-6 lg:col-span-7">
              <h3 className="font-heading text-lg font-bold text-[#0B3B2C]">
                বিষয়ভিত্তিক NCTB দক্ষতা
              </h3>
              <p className="mt-0.5 text-xs text-[#52635B]">
                প্রতিটি অধ্যায় ও শিখনফলের সঠিক মূল্যায়নের ভিত্তিতে নির্ণীত
              </p>

              <div className="mt-5 space-y-4">
                {/* Subject 1: Math */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#18241E]">
                    <span>গণিত (Mathematics)</span>
                    <span className="font-mono text-[#0B3B2C]">৭৮% দক্ষতা</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[#E7E2D8]">
                    <div className="h-full rounded-full bg-[#0B3B2C]" style={{ width: "78%" }} />
                  </div>
                  <span className="mt-1 block text-[11px] text-[#52635B]">
                    ৪টি অধ্যায়ের মধ্যে ৩টি আয়ত্তে এসেছে
                  </span>
                </div>

                {/* Subject 2: Science */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#18241E]">
                    <span>সাধারণ বিজ্ঞান (General Science)</span>
                    <span className="font-mono text-[#0B3B2C]">৬৫% দক্ষতা</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[#E7E2D8]">
                    <div className="h-full rounded-full bg-[#FF5C35]" style={{ width: "65%" }} />
                  </div>
                  <span className="mt-1 block text-[11px] text-[#52635B]">
                    পরমাণুর গঠন ও রাসায়নিক বিক্রিয়া চলমান
                  </span>
                </div>

                {/* Subject 3: Digital Tech */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#18241E]">
                    <span>ডিজিটাল প্রযুক্তি (Digital Technology)</span>
                    <span className="font-mono text-[#0B3B2C]">৮৮% দক্ষতা</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[#E7E2D8]">
                    <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: "88%" }} />
                  </div>
                  <span className="mt-1 block text-[11px] text-[#52635B]">
                    সাইবার নিরাপত্তা ও কোডিং বেসিক সম্পন্ন
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Adaptive Schedule Card */}
            <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAF7F2] p-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-[#0B3B2C]">
                    আজকের পড়ার রুটিন
                  </h3>
                  <Calendar className="h-4 w-4 text-[#52635B]" />
                </div>
                <p className="mt-0.5 text-xs text-[#52635B]">
                  স্টাডি প্ল্যানার অনুযায়ী সাজানো
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-[#E7E2D8]">
                    <div>
                      <p className="text-xs font-bold text-[#0B3B2C]">দ্বিপদী রাশির বিস্তার</p>
                      <p className="text-[11px] text-[#52635B]">গণিত · ২৫ মিনিট</p>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      সম্পন্ন ✓
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-[#E7E2D8]">
                    <div>
                      <p className="text-xs font-bold text-[#0B3B2C]">মৌলের যোজনী ও সংকেত</p>
                      <p className="text-[11px] text-[#52635B]">বিজ্ঞান · ২০ মিনিট</p>
                    </div>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      চলমান...
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E7E2D8]">
                <Link href="/planner">
                  <Button variant="outline" size="sm" className="w-full font-bangla font-bold">
                    সম্পূর্ণ রুটিন দেখুন &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

