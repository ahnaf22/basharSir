"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroSection(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-12 sm:py-16 lg:py-20">
      {/* Background Subtle Accent Pattern */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#FF5C35]/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#0B3B2C]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="space-y-6 lg:col-span-7">
            {/* Pill Badge with Floating Campaign Phrase */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C4] bg-white px-3.5 py-1 text-xs font-bold text-[#0B3B2C] shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-[#FF5C35] animate-ping" />
              <span>প্যাঁচ যতই থাকুক, পড়া হবে!</span>
              <span className="text-[#D8D2C4]">|</span>
              <span className="text-[#FF5C35]">NCTB ২০২৬</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl font-black leading-[1.2] text-[#0B3B2C] sm:text-5xl lg:text-6xl">
              পড়ার সিন এবার <br />
              <span className="relative inline-block text-[#FF5C35]">
                বদলে যাবে!
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7C40 2 80 8 120 4S180 8 198 3"
                    stroke="#FF5C35"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="max-w-xl font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
              তোমার নিজের AI Home Tutor। পড়বে, বুঝবে, প্রশ্ন করবে, ভুল করবে, আবার শিখবে। সবকিছু তোমার নিজের গতিতে।
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-[#0B3B2C] px-7 font-bangla text-base font-bold text-white shadow-md transition hover:bg-[#134E39] hover:shadow-lg"
                >
                  চলো, পড়া শুরু করি!
                  <ArrowRight className="ml-2 h-4 w-4 text-[#FF5C35]" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#D8D2C4] bg-white px-5 font-bangla text-base font-semibold text-[#18241E] hover:bg-[#F3EFE6]"
                >
                  <PlayCircle className="mr-2 h-5 w-5 text-[#0B3B2C]" />
                  কীভাবে কাজ করে?
                </Button>
              </a>
            </div>

            {/* Quick 1-Click Demo Persona Pills */}
            <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4 shadow-xs">
              <p className="font-heading text-xs font-bold text-[#0B3B2C]">
                ⚡ এক ক্লিকে ডেমো অ্যাকাউন্টে ঢুকে সরাসরি ক্লাস দেখুন:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-[#FAF7F2] px-3 py-1.5 font-bangla font-bold text-[#18241E] transition hover:border-[#0B3B2C] hover:bg-white"
                >
                  <span className="h-2 w-2 rounded-full bg-[#0B3B2C]" />
                  রাফি আহমেদ (৮ম শ্রেণি • গণিত)
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-[#FAF7F2] px-3 py-1.5 font-bangla font-bold text-[#18241E] transition hover:border-[#FF5C35] hover:bg-white"
                >
                  <span className="h-2 w-2 rounded-full bg-[#FF5C35]" />
                  নুসরাত আহমেদ (৬ষ্ঠ শ্রেণি • বিজ্ঞান)
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E2D8] bg-[#FAF7F2] px-3 py-1.5 font-bangla font-bold text-[#18241E] transition hover:border-[#F59E0B] hover:bg-white"
                >
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  রাশেদা বেগম (অভিভাবক পোর্টাল)
                </Link>
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-[#52635B]">
              <div className="flex items-center gap-1.5 font-bangla">
                <CheckCircle2 className="h-4 w-4 text-[#0B3B2C] shrink-0" />
                <span>NCTB জাতীয় শিক্ষাক্রম ২০২৬ সংগতিপূর্ণ</span>
              </div>
              <div className="flex items-center gap-1.5 font-bangla">
                <CheckCircle2 className="h-4 w-4 text-[#0B3B2C] shrink-0" />
                <span>বকাঝকা ছাড়াই যতবার ইচ্ছা প্রশ্ন করার সুযোগ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition with Student & Floating Interactive Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Main Student Photography */}
              <div className="overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl ring-1 ring-black/5">
                <Image
                  src="/images/student-study-hero.jpg"
                  alt="পড়ার টেবিলে আত্মবিশ্বাসী বাংলাদেশি শিক্ষার্থী"
                  width={520}
                  height={380}
                  priority
                  className="h-auto w-full object-cover transition duration-500 hover:scale-102"
                />
              </div>

              {/* Floating Interactive AI Lesson Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 right-4 sm:right-6 rounded-2xl border border-[#E7E2D8] bg-white p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B3B2C] text-white">
                    <BrainCircuit className="h-5 w-5 text-[#FF5C35]" />
                  </div>
                  <div className="flex-1 text-xs leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-[#0B3B2C]">
                        বাশার স্যার · AI Tutor
                      </span>
                      <span className="rounded-full bg-[#0B3B2C]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0B3B2C]">
                        লাইভ ক্লাস
                      </span>
                    </div>
                    <p className="mt-1 font-bangla text-[#18241E]">
                      “চলো দেখি, <span className="font-mono font-bold">$2x + 5 = 15$</span> হলে $x$-এর মান কত হবে?”
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-[#F3EFE6] pt-1.5 text-[11px]">
                      <span className="font-bangla font-semibold text-[#0B3B2C]">
                        💡 একটু চিন্তা করো! দুই পাশ থেকে ৫ বাদ দিলে কী থাকে?
                      </span>
                      <span className="font-bold text-[#FF5C35]">ধাপ ২/৫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Campaign Badge Top Right */}
              <div className="absolute -top-3 -right-3 rounded-full border-2 border-white bg-[#FF5C35] px-3.5 py-1 font-heading text-xs font-black text-white shadow-md">
                পড়া হবে!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

