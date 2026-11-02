'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-[#071F17] text-white border-t border-emerald-950/60 pt-16 pb-12 font-body selection:bg-brand-coral selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-coral text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-coral/20 group-hover:scale-105 transition-transform duration-200">
                প
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl text-white tracking-tight leading-tight">
                  পড়া হবে!
                </span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                  PORA HOBE · AI HOME TUTOR
                </span>
              </div>
            </Link>

            <p className="text-white/70 text-sm leading-relaxed mb-6 font-normal">
              তোমার নিজের গতিতে শেখার সেরা বন্ধু। প্রতিটি বিষয়ে গভীর উপলব্ধি, নিখুঁত অনুশীলন ও ভুল থেকে সহজে উত্তরণ — মুখস্থ নয়, খাঁটি বোঝাপড়াই আসল শক্তি।
            </p>

            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>NCTB কারিকুলাম ২০২৬ সমর্থিত</span>
            </div>
          </div>

          {/* Column 1: ফিচারসমূহ */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">
              মূল ফিচার
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="#tutor" className="hover:text-brand-coral transition-colors">
                  AI পার্সোনাল টিউটর
                </Link>
              </li>
              <li>
                <Link href="#mistakes" className="hover:text-brand-coral transition-colors">
                  ভুল থেকে শেখা (সংশোধন)
                </Link>
              </li>
              <li>
                <Link href="#progress" className="hover:text-brand-coral transition-colors">
                  মাস্টারি অ্যানালিটিক্স
                </Link>
              </li>
              <li>
                <Link href="#exams" className="hover:text-brand-coral transition-colors">
                  মডেল টেস্ট ও খাতা স্ক্যান
                </Link>
              </li>
              <li>
                <Link href="#group" className="hover:text-brand-coral transition-colors">
                  ফ্রেন্ডস স্টাডি গ্রুপ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: শ্রেণি ও বিষয় */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">
              শ্রেণি ও কারিকুলাম
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/materials" className="hover:text-brand-coral transition-colors">
                  ৬ষ্ঠ শ্রেণি — বিজ্ঞান ও গণিত
                </Link>
              </li>
              <li>
                <Link href="/materials" className="hover:text-brand-coral transition-colors">
                  ৭ম শ্রেণি — বেসিক অ্যালজেব্রা
                </Link>
              </li>
              <li>
                <Link href="/materials" className="hover:text-brand-coral transition-colors">
                  ৮ম শ্রেণি — জুনিয়র সায়েন্স
                </Link>
              </li>
              <li>
                <Link href="/materials" className="hover:text-brand-coral transition-colors">
                  ৯ম শ্রেণি — পদার্থ, রসায়ন ও জীব
                </Link>
              </li>
              <li>
                <Link href="/materials" className="hover:text-brand-coral transition-colors">
                  ১০ম শ্রেণি (SSC) — বোর্ড প্রস্তুতি
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: পলিসি ও সুরক্ষা */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">
              শিশু সুরক্ষা ও আইন
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/parent/dashboard" className="hover:text-brand-coral transition-colors">
                  অভিভাবক ড্যাশবোর্ড
                </Link>
              </li>
              <li>
                <span className="text-white/60 text-xs block">
                  বাংলাদেশ PDPA ২০২৬ (আইন নং ৬৩/২০২৬) অনুমোদিত নিরাপত্তা ও প্যারেন্টাল কনসেন্ট।
                </span>
              </li>
              <li className="pt-2">
                <Link href="/login" className="hover:text-brand-coral transition-colors font-medium">
                  লগইন পোর্টাল
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-coral transition-colors font-medium">
                  নতুন অ্যাকাউন্ট খুলুন
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span>© ২০২৬</span>
            <span className="font-bold text-white">পড়া হবে! (PORA HOBE)</span>
            <span>· সর্বস্বত্ব সংরক্ষিত।</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-white/75">
            <span>বাংলাদেশে তৈরি</span>
            <span>🇧🇩</span>
            <span>শিক্ষার্থীদের জন্য নিবেদিত</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

