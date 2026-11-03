"use client";

import React, { useState, useEffect } from "react";
import { StudentPerformanceDashboard } from "@/features/analytics/components/StudentPerformanceDashboard";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { fetchGuardianChildrenApi } from "@/features/guardian-portal/api/guardian.api";
import type { GuardianWeeklyChildReportResponse } from "@/features/analytics/types/analytics.types";

interface ChildOption {
  student_code: string;
  full_name_bn: string;
  class_label_bn: string;
}

interface GuardianParentPortalDashboardProps {
  childrenList?: ChildOption[];
  initialReportsByChild?: Record<string, GuardianWeeklyChildReportResponse>;
}

export function GuardianParentPortalDashboard({
  childrenList: initialChildrenList = [],
  initialReportsByChild = {},
}: GuardianParentPortalDashboardProps): React.JSX.Element {
  const [children, setChildren] = useState<ChildOption[]>(initialChildrenList);
  const [selectedCode, setSelectedCode] = useState<string>(
    initialChildrenList[0]?.student_code ?? ""
  );
  const [reportsByChild, setReportsByChild] =
    useState<Record<string, GuardianWeeklyChildReportResponse>>(initialReportsByChild);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync props if provided
  useEffect(() => {
    if (initialChildrenList.length > 0) {
      setChildren(initialChildrenList);
      if (!selectedCode) {
        setSelectedCode(initialChildrenList[0]?.student_code ?? "");
      }
    }
  }, [initialChildrenList, selectedCode]);

  useEffect(() => {
    if (Object.keys(initialReportsByChild).length > 0) {
      setReportsByChild((prev) => ({ ...prev, ...initialReportsByChild }));
    }
  }, [initialReportsByChild]);

  // Load live children from API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveChildren() {
      try {
        const res = await fetchGuardianChildrenApi();
        const rawChildren = res.data?.children ?? [];
        if (isMounted && rawChildren.length > 0) {
          const mapped: ChildOption[] = rawChildren.map((item) => ({
            student_code: item.student.student_code,
            full_name_bn: item.student.name_bn || item.student.name_en,
            class_label_bn: `শ্রেণি ${item.student.current_class_level}`,
          }));
          setChildren(mapped);
          if (!selectedCode || !mapped.some((c) => c.student_code === selectedCode)) {
            setSelectedCode(mapped[0]?.student_code ?? "");
          }
        }
      } catch {
        // Fall back to props if API fails
      }
    }

    loadLiveChildren();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load weekly report for the selected child
  useEffect(() => {
    if (!selectedCode) return;
    let isMounted = true;

    async function loadReport() {
      setLoading(true);
      try {
        const report = await analyticsApi.getGuardianChildWeeklyReport(selectedCode);
        if (isMounted && report) {
          setReportsByChild((prev) => ({
            ...prev,
            [selectedCode]: report,
          }));
        }
      } catch {
        // Keep existing or initial report
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [selectedCode]);

  const activeReport = reportsByChild[selectedCode];
  const pdfDownloadUrl = selectedCode
    ? analyticsApi.getGuardianChildWeeklyReportPdfUrl(selectedCode)
    : "#";

  return (
    <div className="space-y-6">
      {/* Parent Child Switcher & Weekly Report Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-desk-line bg-desk-ink p-6 text-white shadow-sm md:flex-row md:items-center">
        <div>
          <span className="rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold text-desk-accent">
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
          {children.length > 0 && (
            <label className="text-xs font-medium text-slate-200">
              সন্তান নির্বাচন করুন:
              <select
                aria-label="সন্তান নির্বাচন করুন"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="ml-2 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
              >
                {children.map((child) => (
                  <option key={child.student_code} value={child.student_code}>
                    {child.full_name_bn} ({child.class_label_bn})
                  </option>
                ))}
              </select>
            </label>
          )}

          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="download-weekly-pdf-btn"
            className="rounded-xl bg-desk-accent px-4 py-2 text-xs font-semibold text-white hover:bg-desk-accent-hover"
          >
            সাপ্তাহিক রিপোর্ট কার্ড (PDF) ডাউনলোড
          </a>
        </div>
      </div>

      {loading && !activeReport ? (
        <div className="rounded-2xl border border-desk-line bg-desk-paper p-8 text-center text-sm text-desk-muted">
          প্রতিবেদন লোড হচ্ছে...
        </div>
      ) : activeReport ? (
        <StudentPerformanceDashboard initialData={activeReport.analytics} />
      ) : (
        <div className="rounded-2xl border border-desk-line bg-desk-paper p-6 text-sm text-desk-muted">
          কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। অনুগ্রহ করে প্রথমে সন্তান যুক্ত করুন।
        </div>
      )}
    </div>
  );
}


