"use client";

import React from "react";
import { Lightbulb, MessageCircleQuestion, Sparkles, Check, ArrowUpRight } from "lucide-react";

export function BrandStatementSection(): React.JSX.Element {
  return (
    <section id="how-it-works" className="border-t border-[#E7E2D8] bg-[#F4EFE6]/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF5C35]" />
            আমাদের মূল দর্শন
          </span>
          <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
            শুধু পড়া নয়, <span className="text-[#FF5C35]">এবার শেখা জমবে!</span>
          </h2>
          <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
            এখানে শুধু উত্তর মুখস্থ করতে হবে না। প্রতিটি বিষয় বুঝে শেখা, নিজের হাতে সমাধান করা আর ভুল থেকে আরও ভালো হওয়ার সুযোগ আছে।
          </p>
        </div>

        {/* 3 Asymmetric Editorial Visual Highlights */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Highlight 1: বুঝে শেখো */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B3B2C]/10 text-[#0B3B2C]">
              <Lightbulb className="h-6 w-6 text-[#0B3B2C]" />
            </div>
            <div className="mt-6 space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF5C35]">
                ধাপ ০১ · আসল বোঝাপড়া
              </span>
              <h3 className="font-heading text-2xl font-bold text-[#0B3B2C]">
                বুঝে শেখো
              </h3>
              <p className="font-bangla text-sm leading-[1.8] text-[#52635B]">
                কঠিন বিষয় সহজভাবে বুঝে নাও। সূত্রের মুখস্থ সমাধান নয়—বাস্তব জীবনের উদাহরণ ও চিত্র দিয়ে জানো সূত্রটি কীভাবে এলো।
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-3.5 text-xs text-[#0B3B2C] font-semibold flex items-center justify-between">
              <span>$(a+b)^2 = a^2 + 2ab + b^2$ কীভাবে এলো?</span>
              <ArrowUpRight className="h-4 w-4 text-[#FF5C35]" />
            </div>
          </div>

          {/* Highlight 2: প্রশ্ন করে শেখো */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#E7E2D8] bg-[#0B3B2C] p-7 text-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FF5C35]">
              <MessageCircleQuestion className="h-6 w-6 text-[#FF5C35]" />
            </div>
            <div className="mt-6 space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-300">
                ধাপ ০২ · ইন্টারঅ্যাক্টিভ ক্লাস
              </span>
              <h3 className="font-heading text-2xl font-bold text-white">
                প্রশ্ন করে শেখো
              </h3>
              <p className="font-bangla text-sm leading-[1.8] text-slate-200">
                প্রতিটি লেসনে থাকবে ইন্টারঅ্যাকশন। শিক্ষক একতরফা লেকচার দেন না—তোমাকে প্রশ্ন করবেন, তোমার উত্তর শুনবেন, খটকা ভাঙাবেন।
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-3.5 text-xs text-white font-medium flex items-center justify-between">
              <span>“স্যার, মধ্যপদ $2ab$ কেন হলো?”</span>
              <span className="rounded-full bg-[#FF5C35] px-2 py-0.5 text-[10px] font-bold">তাত্ক্ষণিক উত্তর</span>
            </div>
          </div>

          {/* Highlight 3: ভুল থেকে শেখো */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5C35]/10 text-[#FF5C35]">
              <Sparkles className="h-6 w-6 text-[#FF5C35]" />
            </div>
            <div className="mt-6 space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B3B2C]">
                ধাপ ০৩ · আত্মবিশ্বাস বৃদ্ধি
              </span>
              <h3 className="font-heading text-2xl font-bold text-[#0B3B2C]">
                ভুল থেকে শেখো
              </h3>
              <p className="font-bangla text-sm leading-[1.8] text-[#52635B]">
                ভুল হলেই পাবে সঠিক ব্যাখ্যা ও নতুন অনুশীলন। কোনো লাল কালির ভর্ৎসনা নেই—ভুল মানেই শেখার নতুন শুরু।
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-3.5 text-xs text-[#0B3B2C] font-semibold flex items-center justify-between">
              <span className="text-[#0B3B2C]">ভুল থেকে Level Up!</span>
              <span className="text-emerald-700 font-bold">৩ ধাপে হিন্ট</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

