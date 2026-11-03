'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  FilePlus2,
  GitBranch,
  Layers,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { MathBanglaText } from '@/components/math-bangla/MathBanglaText';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  createLearningResourceApi,
  transitionResourceWorkflowApi,
} from '@/features/curriculum/api/curriculum.api';
import type {
  LearningObjectiveDto,
  LearningResourceDto,
  ResourceType,
  ResourceWorkflowStatus,
} from '@/features/curriculum/types/curriculum.types';
import { ApiClientError } from '@/services/api-client';

const WORKFLOW_BADGE_VARIANT: Record<
  ResourceWorkflowStatus,
  'neutral' | 'amber' | 'teal' | 'success' | 'navy'
> = {
  draft: 'neutral',
  in_review: 'amber',
  approved: 'teal',
  published: 'success',
  archived: 'navy',
};

const WORKFLOW_LABELS_BN: Record<ResourceWorkflowStatus, string> = {
  draft: 'খসড়া (Draft)',
  in_review: 'পর্যালোচনাধীন (In Review)',
  approved: 'অনুমোদিত (Approved)',
  published: 'প্রকাশিত ও RAG ইনডেক্সড (Published)',
  archived: 'আর্কাইভড (Archived)',
};

export interface AdminCurriculumCmsWorkspaceProps {
  curriculumVersionId: number;
  curriculumVersionCode: string;
  chapterId: number;
  chapterTitleBn: string;
  objectives: LearningObjectiveDto[];
  initialResources: LearningResourceDto[];
}

export function AdminCurriculumCmsWorkspace({
  curriculumVersionId,
  curriculumVersionCode,
  chapterId,
  chapterTitleBn,
  objectives,
  initialResources,
}: AdminCurriculumCmsWorkspaceProps): React.ReactElement {
  const [resources, setResources] =
    useState<LearningResourceDto[]>(initialResources);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<number>(
    objectives[0]?.id ?? 1
  );
  const [resourceType, setResourceType] =
    useState<ResourceType>('worked_example');
  const [titleBn, setTitleBn] = useState<string>(
    'সমাধানকৃত উদাহরণ: দ্বিপদী রাশির বর্গের অনুসিদ্ধান্ত'
  );
  const [nctbPageRef, setNctbPageRef] = useState<string>('পৃষ্ঠা ৫০–৫১');
  const [contentMarkdown, setContentMarkdown] = useState<string>(
    'দেওয়া আছে $a + b = 7$ এবং $ab = 12$। অতএব, $$(a - b)^2 = (a + b)^2 - 4ab = 7^2 - 4(12) = 49 - 48 = 1$$'
  );

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateDraft = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setIsBusy(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await createLearningResourceApi({
        curriculum_version_id: curriculumVersionId,
        chapter_id: chapterId,
        learning_objective_id: selectedObjectiveId,
        resource_type: resourceType,
        title_bn: titleBn,
        content_markdown: contentMarkdown,
        nctb_page_reference: nctbPageRef || undefined,
      });
      setResources((prev) => [response.data, ...prev]);
      setStatusMessage(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('খসড়া পাঠ্য উপকরণ সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleWorkflowTransition = async (
    resourceId: number,
    targetStatus: ResourceWorkflowStatus
  ): Promise<void> => {
    setIsBusy(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await transitionResourceWorkflowApi(
        resourceId,
        targetStatus
      );
      setResources((prev) =>
        prev.map((item) => (item.id === resourceId ? response.data : item))
      );
      setStatusMessage(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('ওয়ার্কফ্লো অবস্থা পরিবর্তন করতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      data-testid="admin-curriculum-cms"
    >
      {/* Left Column: NCTB Curriculum Tree & Prerequisite DAG Inspector */}
      <div className="space-y-5 lg:col-span-4">
        <Card elevated>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-primary" />
              <h2 className="font-heading text-base font-bold text-brand-primary">
                পাঠ্যক্রম বৃক্ষ ও শিখনফল (DAG)
              </h2>
            </div>
            <Badge variant="navy">{curriculumVersionCode}</Badge>
          </div>

          <p className="mb-3 text-xs font-medium text-content-secondary">
            অধ্যায়: <strong className="text-content-primary">{chapterTitleBn}</strong>
          </p>

          <div className="space-y-2.5">
            {objectives.map((obj) => {
              const isSelected = obj.id === selectedObjectiveId;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => setSelectedObjectiveId(obj.id)}
                  data-testid={`cms-objective-${obj.code}`}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-brand-secondary bg-brand-secondary/10'
                      : 'border-border-subtle bg-canvas hover:bg-subtle'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-brand-primary">
                      {obj.code}
                    </span>
                    <Badge variant="teal">
                      দক্ষতা লক্ষ্যমাত্রা: {toBanglaNumerals(obj.mastery_threshold_pct)}%
                    </Badge>
                  </div>

                  <MathBanglaText content={obj.title_bn} variant="compact" />

                  {obj.prerequisites && obj.prerequisites.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-1.5 text-xs text-content-secondary">
                      <GitBranch className="h-3 w-3 text-brand-secondary" />
                      <span>পূর্বশর্ত (DAG):</span>
                      {obj.prerequisites.map((pr) => (
                        <span
                          key={pr.id}
                          className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-medium text-brand-primary"
                        >
                          {pr.code}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Right Column: Rich Markdown + KaTeX Editor & Editorial Approval Queue */}
      <div className="space-y-6 lg:col-span-8">
        <Card elevated>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-brand-secondary" />
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-primary">
                  পাঠ্যপুস্তক গ্রাউন্ডিং কনটেন্ট এডিটর (Markdown + KaTeX)
                </h2>
                <p className="text-xs text-content-secondary">
                  প্রকাশিত হওয়ার পূর্বে রিভিউয়ারের অনুমোদন (Draft → In Review → Approved → Published) বাধ্যতামূলক
                </p>
              </div>
            </div>
            <Badge variant="teal">Live KaTeX Preview</Badge>
          </div>

          <form onSubmit={handleCreateDraft} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="cms-resource-type"
                  className="mb-1 block font-heading text-xs font-semibold text-content-primary"
                >
                  উপকরণের ধরন
                </label>
                <select
                  id="cms-resource-type"
                  value={resourceType}
                  onChange={(e) =>
                    setResourceType(e.target.value as ResourceType)
                  }
                  className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
                >
                  <option value="lesson_note">পাঠ নোট (Lesson Note)</option>
                  <option value="formula_sheet">সূত্র তালিকা (Formula Sheet)</option>
                  <option value="worked_example">
                    সমাধানকৃত উদাহরণ (Worked Example)
                  </option>
                  <option value="summary">সারসংক্ষেপ (Summary)</option>
                  <option value="definition">সংজ্ঞা (Definition)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cms-title-bn"
                  className="mb-1 block font-heading text-xs font-semibold text-content-primary"
                >
                  শিরোনাম (বাংলায়)
                </label>
                <input
                  id="cms-title-bn"
                  type="text"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="cms-page-ref"
                  className="mb-1 block font-heading text-xs font-semibold text-content-primary"
                >
                  NCTB পাঠ্যবই পৃষ্ঠা সূত্র
                </label>
                <input
                  id="cms-page-ref"
                  type="text"
                  value={nctbPageRef}
                  onChange={(e) => setNctbPageRef(e.target.value)}
                  placeholder="যেমন: পৃষ্ঠা ৪৭–৫২"
                  className="w-full rounded-lg border border-border-subtle bg-canvas px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="cms-markdown-input"
                  className="mb-1 block font-heading text-xs font-semibold text-content-primary"
                >
                  পাঠ্যবস্তু (বাংলা ও LaTeX `$...$` / `$$...$$`)
                </label>
                <textarea
                  id="cms-markdown-input"
                  rows={6}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-canvas p-3 font-mono text-xs leading-relaxed"
                  data-testid="cms-markdown-input"
                  required
                />
              </div>

              <div>
                <span className="mb-1 flex items-center gap-1.5 font-heading text-xs font-semibold text-brand-primary">
                  <Eye className="h-3.5 w-3.5 text-brand-secondary" />
                  <span>লাইভ বাংলা + গণিত প্রিভিউ (MathBanglaText)</span>
                </span>
                <div
                  className="min-h-[148px] rounded-lg border border-border-subtle bg-subtle p-3.5"
                  data-testid="cms-live-preview"
                >
                  <MathBanglaText
                    content={contentMarkdown}
                    variant="lesson-body"
                  />
                </div>
              </div>
            </div>

            {statusMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-xs font-medium text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs font-medium text-status-danger">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isBusy}
              data-testid="cms-create-draft-btn"
            >
              খসড়া (Draft) হিসেবে সংরক্ষণ করুন
            </Button>
          </form>
        </Card>

        {/* Editorial Approval & RAG Indexing Queue */}
        <Card elevated>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              <h3 className="font-heading text-base font-bold text-brand-primary">
                রিভিউয়ার অনুমোদন কিউ ও RAG ইনডেক্সিং অবস্থা
              </h3>
            </div>
            <Badge variant="navy">
              মোট উপকরণ: {toBanglaNumerals(resources.length)}টি
            </Badge>
          </div>

          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                data-testid={`cms-resource-row-${res.id}`}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border-subtle bg-canvas p-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={WORKFLOW_BADGE_VARIANT[res.workflow_status]}>
                      {WORKFLOW_LABELS_BN[res.workflow_status]}
                    </Badge>
                    {res.nctb_page_reference && (
                      <span className="text-xs text-content-secondary">
                        {res.nctb_page_reference}
                      </span>
                    )}
                    {res.vector_embedding_id && (
                      <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs text-brand-secondary">
                        RAG: {res.vector_embedding_id}
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading text-sm font-bold text-brand-primary">
                    {res.title_bn}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {res.workflow_status === 'draft' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        handleWorkflowTransition(res.id, 'in_review')
                      }
                      data-testid={`transition-in-review-${res.id}`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>রিভিউয়ে পাঠান (In Review)</span>
                    </Button>
                  )}

                  {res.workflow_status === 'in_review' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        handleWorkflowTransition(res.id, 'approved')
                      }
                      data-testid={`transition-approved-${res.id}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>অনুমোদন করুন (Approve)</span>
                    </Button>
                  )}

                  {res.workflow_status === 'approved' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        handleWorkflowTransition(res.id, 'published')
                      }
                      data-testid={`transition-published-${res.id}`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>প্রকাশ ও RAG ইনডেক্স করুন (Publish)</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

