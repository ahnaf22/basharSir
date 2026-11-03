"use client";

import React, { useState } from "react";
import { toBanglaNumerals } from "@/components/math-bangla/bangla-numerals";

export function TeacherMarketplaceAndExpansionWorkspace(): React.JSX.Element {
  const [selectedStage, setSelectedStage] = useState<
    "primary_1_5" | "junior_6_8" | "ssc_9_10"
  >("ssc_9_10");
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Section 1: NCTB Class 1-10 Curriculum Expansion Selector (Chunk 6.4) */}
      <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm">
        <span className="rounded-full bg-desk-accent/10 px-3 py-1 text-xs font-bold text-desk-accent-ink">
          এনসিটিবি ১ম – ১০ম শ্রেণি পাঠ্যক্রম সম্প্রসারণ (Primary • Junior • SSC)
        </span>
        <h2 className="mt-2 font-heading text-xl font-bold text-desk-ink">
          শিক্ষাস্তর ও শ্রেণিভিত্তিক পাঠ্যক্রম নির্বাচন
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="stage-btn-primary"
            onClick={() => setSelectedStage("primary_1_5")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              selectedStage === "primary_1_5"
                ? "bg-desk-ink text-white"
                : "bg-desk-paper-3 text-desk-text-2"
            }`}
          >
            প্রাথমিক স্তর (১ম – ৫ম শ্রেণি)
          </button>
          <button
            type="button"
            data-testid="stage-btn-junior"
            onClick={() => setSelectedStage("junior_6_8")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              selectedStage === "junior_6_8"
                ? "bg-desk-ink text-white"
                : "bg-desk-paper-3 text-desk-text-2"
            }`}
          >
            নিম্ন মাধ্যমিক (৬ষ্ঠ – ৮ম শ্রেণি)
          </button>
          <button
            type="button"
            data-testid="stage-btn-ssc"
            onClick={() => setSelectedStage("ssc_9_10")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              selectedStage === "ssc_9_10"
                ? "bg-desk-ink text-white"
                : "bg-desk-paper-3 text-desk-text-2"
            }`}
          >
            মাধ্যমিক ও এসএসসি (৯ম – ১০ম শ্রেণি)
          </button>
        </div>

        <div
          data-testid="selected-stage-panel"
          className="mt-4 rounded-xl border border-desk-line bg-desk-paper-2 p-4 text-xs text-desk-text"
        >
          {selectedStage === "primary_1_5"
            ? "প্রাথমিক স্তর (১ম–৫ম শ্রেণি): গল্প ও ছবির মাধ্যমে প্রাথমিক গণিত ও প্রাথমিক বিজ্ঞান।"
            : selectedStage === "junior_6_8"
              ? "নিম্ন মাধ্যমিক স্তর (৬ষ্ঠ–৮ম শ্রেণি): বীজগণিত, জ্যামিতি ও সাধারণ বিজ্ঞান।"
              : "মাধ্যমিক ও এসএসসি প্রস্তুতি (৯ম–১০ম শ্রেণি): পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও বোর্ড সৃজনশীল রুব্রিক।"}
        </div>
      </div>

      {/* Section 2: Verified Human Teacher Marketplace + AI Diagnostic Hand-Off (Chunks 6.1, 6.2, 6.3) */}
      <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-desk-ink">
              যাচাইকৃত মানব শিক্ষক মার্কেটপ্লেস ও এআই ডায়াগনস্টিক হ্যান্ড-অফ
            </h2>
            <p className="mt-1 text-xs text-desk-muted">
              লাইভ সেশন শুরুর পূর্বেই শিক্ষার্থীর দুর্বল টপিক ও ভুল ধারণার এআই ডায়াগনস্টিক ব্রিফ শিক্ষকের কাছে পৌঁছে যায়।
            </p>
          </div>
          <button
            type="button"
            data-testid="book-verified-teacher-btn"
            onClick={() => setBookingConfirmed(true)}
            className="rounded-xl bg-desk-accent px-4 py-2.5 text-xs font-bold text-white"
          >
            ১-অন-১ লাইভ সেশন বুক করুন (৳{toBanglaNumerals(600)}/ঘণ্টা)
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-desk-accent-line bg-desk-accent-soft p-4 text-xs">
          <p className="font-bold text-desk-ink">
            ড. মাহবুবুর রহমান (গণিত ও পদার্থবিজ্ঞান • ঢাকা বিশ্ববিদ্যালয় • Verified)
          </p>
          <p className="mt-1 text-desk-text-2">
            এসক্রো পেমেন্ট বিভাজন: শিক্ষক লভ্যাংশ ৮০% (৳{toBanglaNumerals(480)}) • প্ল্যাটফর্ম ফি ২০% (৳{toBanglaNumerals(120)})
          </p>
          <p
            data-testid="ai-diagnostic-handoff-summary"
            className="mt-1.5 font-semibold text-desk-accent-ink"
          >
            প্রাক-সেশন এআই ডায়াগনস্টিক ব্রিফ: শিক্ষার্থী ‘সরল সমীকরণ’ অংশে ৪৪% দক্ষতায় আছে; পক্ষান্তর বিধিতে অতিরিক্ত অনুশীলন প্রয়োজন।
          </p>
        </div>

        {bookingConfirmed ? (
          <div
            data-testid="teacher-booking-confirmed-banner"
            className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900"
          >
            লাইভ সেশন বুকিং নিশ্চিত হয়েছে এবং এআই ডায়াগনস্টিক ব্রিফ শিক্ষকের ড্যাশবোর্ডে পাঠানো হয়েছে।
          </div>
        ) : null}
      </div>
    </div>
  );
}

