'use client';

import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Ban, CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChildSwitcher } from '@/components/layout/ChildSwitcher';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  approveMinorConsentApi,
  fetchGuardianChildrenApi,
  linkChildToGuardianApi,
  revokeMinorConsentApi,
} from '@/features/guardian-portal/api/guardian.api';
import { ApiClientError } from '@/services/api-client';

export default function GuardianChildrenConsentPage(): React.ReactElement {
  const linkedChildren = useAuthStore((state) => state.linkedChildren);
  const activeStudentCode = useAuthStore((state) => state.activeStudentCode);
  const setLinkedChildren = useAuthStore((state) => state.setLinkedChildren);
  const setActiveStudentCode = useAuthStore((state) => state.setActiveStudentCode);

  const [studentCodeInput, setStudentCodeInput] = useState<string>('');
  const [aiTutoringScope, setAiTutoringScope] = useState<boolean>(true);
  const [ocrScope, setOcrScope] = useState<boolean>(true);
  const [groupStudyScope, setGroupStudyScope] = useState<boolean>(false);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeChild = linkedChildren.find(
    (c) => c.student.student_code === activeStudentCode
  );

  const refreshChildren = async (): Promise<void> => {
    setIsBusy(true);
    setErrorText(null);
    try {
      const response = await fetchGuardianChildrenApi();
      setLinkedChildren(response.data.children);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorText(error.message);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleLinkChild = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    if (!studentCodeInput.trim()) {
      return;
    }

    setIsBusy(true);
    setFeedback(null);
    setErrorText(null);

    try {
      const response = await linkChildToGuardianApi({
        student_code: studentCodeInput.trim(),
      });
      const updated = [
        response.data,
        ...linkedChildren.filter(
          (item) =>
            item.student.student_code !== response.data.student.student_code
        ),
      ];
      setLinkedChildren(updated);
      setActiveStudentCode(response.data.student.student_code);
      setStudentCodeInput('');
      setFeedback(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorText(error.message);
      } else {
        setErrorText('সন্তানের প্রোফাইল যুক্ত করতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleApproveConsent = async (studentCode: string): Promise<void> => {
    setIsBusy(true);
    setFeedback(null);
    setErrorText(null);

    try {
      const response = await approveMinorConsentApi({
        student_code: studentCode,
        ai_tutoring: aiTutoringScope,
        handwritten_ocr: ocrScope,
        group_study: groupStudyScope,
        verification_method: 'guardian_portal',
      });

      const updated = linkedChildren.map((item) =>
        item.student.student_code === studentCode ? response.data.child : item
      );
      setLinkedChildren(updated);
      setFeedback(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorText(error.message);
      } else {
        setErrorText('সম্মতি সংরক্ষণে সমস্যা হয়েছে।');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleRevokeConsent = async (studentCode: string): Promise<void> => {
    setIsBusy(true);
    setFeedback(null);
    setErrorText(null);

    try {
      const response = await revokeMinorConsentApi({
        student_code: studentCode,
      });
      const updated = linkedChildren.map((item) =>
        item.student.student_code === studentCode ? response.data.child : item
      );
      setLinkedChildren(updated);
      setFeedback(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorText(error.message);
      } else {
        setErrorText('সম্মতি প্রত্যাহার করতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <AppShell
      title="অভিভাবক পোর্টাল · সন্তান ও PDPA ২০২৬ সম্মতি ব্যবস্থাপনা"
      subtitle="একাধিক সন্তানের অগ্রগতি পর্যবেক্ষণ এবং ব্যক্তিগত উপাত্ত সুরক্ষা সম্মতি প্রদান"
      headerRight={
        <ChildSwitcher
          childrenList={linkedChildren}
          activeStudentCode={activeStudentCode}
          onSelectChild={setActiveStudentCode}
        />
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Link Child Form */}
        <div className="space-y-5 lg:col-span-4">
          <Card elevated>
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand-primary" />
              <h2 className="font-heading text-base font-bold text-brand-primary">
                সন্তানের প্রোফাইল যুক্ত করুন
              </h2>
            </div>
            <p className="mb-4 text-xs text-content-secondary">
              সন্তানের নিবন্ধনের সময় প্রাপ্ত শিক্ষার্থী কোড (যেমন: STD-2026-XXXXXX) লিখুন।
            </p>

            <form onSubmit={handleLinkChild} className="space-y-3">
              <input
                type="text"
                value={studentCodeInput}
                onChange={(e) => setStudentCodeInput(e.target.value)}
                placeholder="STD-2026-004812"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-3.5 py-2 font-mono text-sm"
                data-testid="link-student-code-input"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isBusy}
                className="w-full"
              >
                সন্তান যুক্ত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={refreshChildren}
                className="w-full"
              >
                তালিকা রিফ্রেশ করুন
              </Button>
            </form>
          </Card>
        </div>

        {/* Right column: Active Child PDPA 2026 Consent Management */}
        <div className="space-y-5 lg:col-span-8">
          <Card elevated>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-brand-secondary" />
                <div>
                  <h2 className="font-heading text-lg font-bold text-brand-primary">
                    বাংলাদেশ ব্যক্তিগত উপাত্ত সুরক্ষা আইন, ২০২৬ (PDPA 2026) সম্মতিপত্র
                  </h2>
                  <p className="text-xs text-content-secondary">
                    নীতিমালা সংস্করণ: PDPA-2026-v1 · অপ্রাপ্তবয়স্ক শিক্ষার্থীর তথ্য সুরক্ষা ও এআই ব্যবহারের অনুমতি
                  </p>
                </div>
              </div>
              <Badge variant="navy">Act No. 63 of 2026</Badge>
            </div>

            {feedback && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>{feedback}</span>
              </div>
            )}

            {errorText && (
              <div className="mb-4 rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs font-medium text-status-danger">
                {errorText}
              </div>
            )}

            {activeChild ? (
              <div className="space-y-4" data-testid="active-child-consent-card">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-subtle p-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-brand-primary">
                      {activeChild.student.name_bn ?? activeChild.student.name_en}
                    </h3>
                    <p className="text-xs text-content-secondary">
                      কোড: <span className="font-mono">{activeChild.student.student_code}</span> · শ্রেণি{' '}
                      {toBanglaNumerals(activeChild.student.current_class_level)} (
                      {activeChild.student.medium === 'bangla'
                        ? 'বাংলা মাধ্যম'
                        : activeChild.student.medium}
                      )
                    </p>
                  </div>

                  <Badge
                    variant={
                      activeChild.student.consent_status === 'verified'
                        ? 'success'
                        : 'amber'
                    }
                  >
                    {activeChild.student.consent_status === 'verified'
                      ? 'সম্মতি অনুমোদিত (Verified)'
                      : activeChild.student.consent_status === 'withdrawn'
                        ? 'সম্মতি প্রত্যাহারকৃত (Withdrawn)'
                        : 'সম্মতি অপেক্ষমাণ (Pending)'}
                  </Badge>
                </div>

                <div className="space-y-2.5 rounded-xl border border-border-subtle p-4">
                  <p className="font-heading text-sm font-semibold text-brand-primary">
                    অনুমোদনের পরিধি (Consent Scope):
                  </p>

                  <label className="flex items-center gap-2.5 text-sm text-content-primary">
                    <input
                      type="checkbox"
                      checked={aiTutoringScope}
                      onChange={(e) => setAiTutoringScope(e.target.checked)}
                      className="h-4 w-4 rounded border-border-subtle"
                    />
                    <span>
                      ব্যক্তিগতকৃত এআই গৃহশিক্ষক ও ধাপে ধাপে পাঠদান (PII গোপন রেখে)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-content-primary">
                    <input
                      type="checkbox"
                      checked={ocrScope}
                      onChange={(e) => setOcrScope(e.target.checked)}
                      className="h-4 w-4 rounded border-border-subtle"
                    />
                    <span>
                      হাতে লেখা উত্তরপত্রের ছবি মূল্যায়ন ও রুব্রিক ফিডব্যাক (OCR)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-content-primary">
                    <input
                      type="checkbox"
                      checked={groupStudyScope}
                      onChange={(e) => setGroupStudyScope(e.target.checked)}
                      className="h-4 w-4 rounded border-border-subtle"
                    />
                    <span>৩–৫ জনের ছোট গ্রুপ স্টাডি সেশনে অংশগ্রহণ (ঐচ্ছিক)</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={isBusy}
                    onClick={() =>
                      handleApproveConsent(activeChild.student.student_code)
                    }
                    data-testid="approve-consent-btn"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>PDPA ২০২৬ সম্মতি অনুমোদন করুন</span>
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    disabled={isBusy}
                    onClick={() =>
                      handleRevokeConsent(activeChild.student.student_code)
                    }
                    data-testid="revoke-consent-btn"
                  >
                    <Ban className="h-4 w-4" />
                    <span>সম্মতি প্রত্যাহার করুন</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center text-sm text-content-secondary">
                বাম পাশের ফর্ম থেকে সন্তানের শিক্ষার্থী কোড যুক্ত করুন অথবা তালিকা রিফ্রেশ করুন।
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

