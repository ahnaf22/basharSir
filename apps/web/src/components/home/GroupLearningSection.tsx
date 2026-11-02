"use client";

import React from "react";
import Link from "next/link";
import { Users, Hand, MessageSquare, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STUDENTS = [
  { name: "রাফি আহমেদ", role: "৮ম শ্রেণি", status: "অনলাইন", color: "bg-teal-500" },
  { name: "তানভীর হাসান", role: "৮ম শ্রেণি", status: "হাত তুলেছে ✋", color: "bg-amber-500" },
  { name: "তাসনিম জাহান", role: "৮ম শ্রেণি", status: "উত্তর দিল", color: "bg-blue-500" },
  { name: "সাদমান সাকিব", role: "৮ম শ্রেণি", status: "অনলাইন", color: "bg-emerald-500" },
];

export function GroupLearningSection(): React.JSX.Element {
  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Group Room Visual Composition */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white shadow-xl">
              {/* Group Room Header */}
              <div className="flex items-center justify-between border-b border-[#E7E2D8] bg-[#0B3B2C] p-4 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-heading text-sm font-bold">
                    গ্রুপ স্টাডি রুম #৮০৪ · গণিত আড্ডা
                  </span>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                  ৪ জন সহপাঠী
                </span>
              </div>

              {/* Group Members Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF7F2]">
                {STUDENTS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-2xl border border-[#E7E2D8] bg-white p-3 shadow-2xs"
                  >
                    <div className={`h-8 w-8 rounded-full ${s.color} text-white font-bold flex items-center justify-center text-xs`}>
                      {s.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0B3B2C]">{s.name}</p>
                      <p className="text-[10px] text-[#52635B]">{s.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Central Tutor Live Broadcast Question */}
              <div className="p-5 border-t border-[#E7E2D8] bg-white space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0B3B2C]">
                  <span>বাশার স্যার (ব্রডকাস্ট প্রশ্ন):</span>
                  <span className="text-[#FF5C35]">পোল চলছে...</span>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs font-bangla text-[#0B3B2C] font-semibold">
                  “চলো বন্ধুরা, দ্রুত উত্তর দাও: $(a-b)^2 = ?$ এর মধ্যপদ কী?”
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#52635B]">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Hand className="h-3.5 w-3.5" /> তানভীর হাত তুলেছে
                  </span>
                  <span className="font-bold text-emerald-700">৩/৪ জন ভোট দিয়েছে</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Highlights */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C]">
              <Users className="h-3.5 w-3.5 text-[#FF5C35]" />
              <span>সহপাঠীদের সাথে সম্মিলিত প্রস্তুতি</span>
            </div>

            <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
              বন্ধুদের নিয়ে পড়ার <br />
              <span className="text-[#FF5C35]">আড্ডাও হবে!</span>
            </h2>

            <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
              বন্ধুদের ইনভাইট করো, একসাথে শেখো, প্রশ্ন করো আর একে অপরের সাথে এগিয়ে যাও।
            </p>

            <div className="space-y-3.5 text-sm font-bangla text-[#18241E]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>৩–৫ জন বন্ধুর জন্য প্রাইভেট স্টাডি রুম</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>সবার সাথে সম্মিলিত পোল কুইজ ও একযোগে ফলাফল প্রকাশ</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#0B3B2C] shrink-0 mt-0.5" />
                <span>কারো বুঝতে সমস্যা হলে এআই শিক্ষক পাশে এসে আলাদা করে বুঝিয়ে দেন</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/group-learning">
                <Button size="lg" className="bg-[#0B3B2C] font-bangla font-bold text-white hover:bg-[#134E39]">
                  গ্রুপ স্টাডি রুমে প্রবেশ করো
                  <ArrowRight className="ml-2 h-4 w-4 text-[#FF5C35]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

