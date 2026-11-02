"use client";

import React from "react";
import Link from "next/link";
import { Award, Trophy, Star, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const BADGES = [
  {
    icon: "🔥",
    title: "ধারাবাহিক সাধক",
    desc: "৩ দিনের একটানা পড়ার স্ট্রিক বজায় রাখার জন্য",
    rarity: "স্ট্রিক ব্যাজ",
  },
  {
    icon: "📐",
    title: "বীজগণিত বস",
    desc: "অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি ১০০% সম্পন্ন",
    rarity: "অধ্যায় মাস্টারি",
  },
  {
    icon: "🧪",
    title: "খুঁতখুঁতে বিজ্ঞানী",
    desc: "পরমাণুর গঠন ও পর্যায় সারণির কুইজে পুরো নম্বর",
    rarity: "বিজ্ঞান স্কলার",
  },
  {
    icon: "⚡",
    title: "স্পিড মাস্টার",
    desc: "সময়ের আগেই নির্ভুলভাবে মডেল টেস্ট জমা",
    rarity: "পরীক্ষা ট্রফি",
  },
];

export function AchievementSection(): React.JSX.Element {
  return (
    <section className="border-t border-[#E7E2D8] bg-[#FAF7F2] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900">
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            অর্জন ও উদযাপন
          </span>
          <h2 className="font-heading text-3xl font-black text-[#0B3B2C] sm:text-4xl lg:text-5xl">
            চ্যাপ্টার খতম, <span className="text-[#FF5C35]">কনফিডেন্স ডাবল!</span>
          </h2>
          <p className="font-bangla text-base leading-[1.85] text-[#52635B] sm:text-lg">
            একটা একটা করে চ্যাপ্টার শেষ করো, নিজের স্কিল বাড়াও আর প্রতিটি অর্জন উদযাপন করো।
          </p>
        </div>

        {/* Celebration Banner Card */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-[#E7E2D8] bg-white p-6 shadow-xl sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left: Trophy Callout */}
            <div className="text-center lg:col-span-5 lg:text-left space-y-3">
              <span className="inline-block rounded-2xl bg-amber-100 p-4 text-4xl shadow-xs">
                🏆
              </span>
              <h3 className="font-heading text-2xl font-black text-[#0B3B2C]">
                “চ্যাপ্টার ক্লিয়ার, বস!”
              </h3>
              <p className="font-bangla text-sm leading-[1.8] text-[#52635B]">
                প্রতিটি অধ্যায় শেষে যখন তুমি সবকটি শিখনফল অর্জন করবে, তোমার ঝুলিতে জমা হবে সম্মানসূচক ব্যাজ ও এক্সপি (XP)। পড়ার আনন্দ বাড়বে দ্বিগুণ!
              </p>
              <div className="pt-2">
                <Link href="/analytics">
                  <Button size="sm" className="bg-[#0B3B2C] font-bangla font-bold text-white hover:bg-[#134E39]">
                    আমার সকল অর্জন দেখো
                    <ArrowRight className="ml-1.5 h-4 w-4 text-[#FF5C35]" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Badges Showcase Grid */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-7">
              {BADGES.map((b, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3.5 rounded-2xl border border-[#E7E2D8] bg-[#FAF7F2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0B3B2C] hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs">
                    {b.icon}
                  </div>
                  <div>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#FF5C35]">
                      {b.rarity}
                    </span>
                    <h4 className="mt-1 font-heading text-sm font-bold text-[#0B3B2C]">
                      {b.title}
                    </h4>
                    <p className="font-bangla text-xs text-[#52635B]">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

