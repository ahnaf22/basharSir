"use client";

import React, { useState } from "react";
import { StudentPerformanceDashboard } from "@/features/analytics/components/StudentPerformanceDashboard";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import type { GuardianWeeklyChildReportResponse } from "@/features/analytics/types/analytics.types";

interface ChildOption {
  student_code: string;
  full_name_bn: string;
  class_label_bn: string;
}

interface GuardianParentPortalDashboardProps {
  childrenList: ChildOption[];
  initialReportsByChild: Record<string, GuardianWeeklyChildReportResponse>;
}

export function GuardianParentPortalDashboard({
  childrenList,
  initialReportsByChild,
}: GuardianParentPortalDashboardProps): React.JSX.Element {
  const firstChildCode = childrenList[0]?.student_code ?? "";
  const [selectedCode, setSelectedCode] = useState<string>(firstChildCode);

  const activeReport = initialReportsByChild[selectedCode];
  const pdfDownloadUrl = analyticsApi.getGuardianChildWeeklyReportPdfUrl(selectedCode);

  return (
    <div className="space-y-6">
      {/* Parent Child Switcher & Weekly Report Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-[#0F2942] p-6 text-white shadow-sm md:flex-row md:items-center">
        <div>
          <span className="rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold text-teal-200">
            অভিভাবক পোর্টাল (Guardian Portal • PDPA 2026 Verified)
          </span>
          <h1 className="mt-2 font-heading text-2xl font-bold">
            সন্তানের সাপ্তাহিক অগ্রগতি প্রতিবেদন
          </h1>
          {activeReport ? (
            <p
              data-testid="guardian-executive-summary"
              className="mt-1 max-w-2xl text-sm text-slate-200"
            >
              {activeReport.executive_summary_bn}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-slate-200">
            সন্তান নির্বাচন করুন:
            <select
              aria-label="সন্তান নির্বাচন করুন"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="ml-2 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
            >
              {childrenList.map((child) => (
                <option key={child.student_code} value={child.student_code}>
                  {child.full_name_bn} ({child.class_label_bn})
                </option>
              ))}
            </select>
          </label>

          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="download-weekly-pdf-btn"
            className="rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D9488]/90"
          >
            সাপ্তাহিক রিপোর্ট কার্ড (PDF) ডাউনলোড
          </a>
        </div>
      </div>

      {activeReport ? (
        <StudentPerformanceDashboard initialData={activeReport.analytics} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
        </div>
      )}
    </div>
  );
}

