'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function FinalCTASection() {
  const [selectedClass, setSelectedClass] = useState<string>('৯ম শ্রেণি');

  const classes = [
    { label: '৬ষ্ঠ শ্রেণি', id: 'class-6', note: 'বিজ্ঞান ও গণিত ফাউন্ডেশন' },
    { label: '৭ম শ্রেণি', id: 'class-7', note: 'লাইফ সায়েন্স ও বেসিক অ্যালজেব্রা' },
    { label: '৮ম শ্রেণি', id: 'class-8', note: 'জুনিয়র বোর্ড প্রিপারেশন' },
    { label: '৯ম শ্রেণি', id: 'class-9', note: 'পদার্থ, রসায়ন ও উচ্চতর গণিত' },
    { label: '১০ম (SSC)', id: 'class-10', note: 'মডেল টেস্ট ও সৃজনশীল স্পেশাল' },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Container */}
        <div className="relative rounded-3xl bg-brand-primary text-white overflow-hidden shadow-2xl border border-white/10 px-6 py-16 sm:px-16 sm:py-20 lg:p-24">
          {/* Subtle Ambient Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-coral/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Watermark Logo / Badge in Background */}
          <div className="absolute -right-12 -bottom-12 select-none opacity-5 font-black text-[180px] leading-none tracking-tight pointer-events-none text-white">
            পড়া হবে!
          </div>

          <div className="relative z-10 max-w-3xl">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-brand-coral font-bold text-xs sm:text-sm tracking-wide mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-coral animate-ping" />
              <span>আজকে পড়া হবে, বুঝেও হবে!</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.25] tracking-tight mb-6">
              পড়ার সিন এবার <span className="text-brand-coral underline decoration-brand-coral/40 underline-offset-8">বদলে যাবে!</span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-white/80 font-normal leading-relaxed mb-10 max-w-2xl font-body">
              নিজের মতো করে শেখা শুরু করো। প্রতিটি চ্যাপ্টার, প্রতিটি প্রশ্ন আর প্রতিটি ভুল তোমাকে নিয়ে যাবে আরও এক ধাপ সামনে। কোনো মুখস্থের চাপ নেই, শুধু নিখাদ বুঝে পড়া।
            </p>

            {/* Class Pill Selector */}
            <div className="mb-10">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                তোমার শ্রেণি বেছে নাও:
              </div>
              <div className="flex flex-wrap gap-2.5">
                {classes.map((c) => {
                  const isActive = selectedClass === c.label;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClass(c.label)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                        isActive
                          ? 'bg-brand-coral text-white border-brand-coral shadow-lg shadow-brand-coral/30 scale-105'
                          : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-white/60 mt-2 font-mono">
                নির্বাচিত লক্ষ্য: <span className="text-white font-medium">{classes.find(c => c.label === selectedClass)?.note}</span>
              </p>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-heading font-black text-base text-brand-primary bg-white hover:bg-brand-canvas transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group text-center"
              >
                <span>চলো, পড়া শুরু করি!</span>
                <svg className="w-5 h-5 ml-2 text-brand-primary transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-heading font-bold text-base text-white border border-white/20 hover:bg-white/10 transition-all duration-200 text-center"
              >
                আগে থেকেই অ্যাকাউন্ট আছে? লগইন করো
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>NCTB ২০২৬ জাতীয় শিক্ষাক্রম অনুমোদিত</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>বাংলাদেশ PDPA ২০২৬ শিশু সুরক্ষা নীতি</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>কোনো ক্রেডিট কার্ড ছাড়াই ফ্রি ট্রায়াল</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

