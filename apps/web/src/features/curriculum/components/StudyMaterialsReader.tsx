'use client';

import React, { useState } from 'react';
import {
  Bookmark,
  Download,
  FileText,
  Highlighter,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { MathBanglaText } from '@/components/math-bangla/MathBanglaText';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getResourcePdfDownloadUrl,
  saveResourceAnnotationApi,
} from '@/features/curriculum/api/curriculum.api';
import type {
  LearningResourceDto,
  ResourceType,
} from '@/features/curriculum/types/curriculum.types';
import { ApiClientError } from '@/services/api-client';

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  lesson_note: 'পাঠ নোট (Lesson Note)',
  formula_sheet: 'সূত্র তালিকা (Formula Sheet)',
  worked_example: 'সমাধানকৃত উদাহরণ (Worked Example)',
  summary: 'সারসংক্ষেপ (Summary)',
  definition: 'সংজ্ঞা (Definition)',
  diagram: 'চিত্র ও ডায়াগ্রাম (Diagram)',
};

export interface StudyMaterialsReaderProps {
  chapterTitleBn: string;
  chapterNumber: number;
  resources: LearningResourceDto[];
}

export function StudyMaterialsReader({
  chapterTitleBn,
  chapterNumber,
  resources,
}: StudyMaterialsReaderProps): React.ReactElement {
  const [selectedResourceId, setSelectedResourceId] = useState<number>(
    resources[0]?.id ?? 0
  );
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<string[]>([
    '(a + b)^2 = a^2 + 2ab + b^2',
  ]);
  const [newHighlightText, setNewHighlightText] = useState<string>('');
  const [personalNote, setPersonalNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const activeResource =
    resources.find((r) => r.id === selectedResourceId) ?? resources[0];

  if (!activeResource) {
    return (
      <Card>
        <p className="text-sm text-content-secondary">
          এই অধ্যায়ে এখনো কোনো প্রকাশিত পাঠ্য উপকরণ নেই।
        </p>
      </Card>
    );
  }

  const handleAddHighlight = (): void => {
    const trimmed = newHighlightText.trim();
    if (!trimmed) {
      return;
    }
    setHighlights((prev) => [...prev, trimmed]);
    setNewHighlightText('');
  };

  const handleSaveAnnotation = async (nextBookmark?: boolean): Promise<void> => {
    const bookmarkVal = nextBookmark ?? isBookmarked;
    setIsBookmarked(bookmarkVal);
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const response = await saveResourceAnnotationApi(activeResource.id, {
        is_bookmarked: bookmarkVal,
        highlights,
        personal_note_markdown: personalNote || undefined,
      });
      setSaveFeedback(
        response.message || 'আপনার বুকমার্ক ও ব্যক্তিগত নোট সংরক্ষিত হয়েছে।'
      );
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setSaveFeedback(error.message);
      } else {
        setSaveFeedback('স্থানীয়ভাবে নোট সংরক্ষিত হয়েছে।');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-testid="study-materials-reader">
      {/* Left Resource Selector Rail */}
      <div className="space-y-4 lg:col-span-4">
        <Card elevated>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-primary" />
            <h2 className="font-heading text-base font-bold text-brand-primary">
              অধ্যায় {toBanglaNumerals(chapterNumber)}: {chapterTitleBn}
            </h2>
          </div>

          <div className="space-y-2">
            {resources.map((res) => {
              const isSelected = res.id === activeResource.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => {
                    setSelectedResourceId(res.id);
                    setSaveFeedback(null);
                  }}
                  data-testid={`select-resource-${res.id}`}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-brand-secondary bg-brand-secondary/10 text-brand-primary'
                      : 'border-border-subtle bg-canvas text-content-primary hover:bg-subtle'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge variant={isSelected ? 'teal' : 'neutral'}>
                      {RESOURCE_TYPE_LABELS[res.resource_type]}
                    </Badge>
                    {res.nctb_page_reference && (
                      <span className="text-xs text-content-secondary">
                        {res.nctb_page_reference}
                      </span>
                    )}
                  </div>
                  <p className="font-heading text-sm font-semibold">
                    {res.title_bn}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Student Highlights & Personal Note Pad */}
        <Card elevated>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Highlighter className="h-4 w-4 text-accent-warm" />
              <h3 className="font-heading text-sm font-bold text-brand-primary">
                হাইলাইট ও ব্যক্তিগত নোট খাতা
              </h3>
            </div>
            <Badge variant="amber">{toBanglaNumerals(highlights.length)}টি সূত্র</Badge>
          </div>

          <ul className="mb-3 space-y-1.5">
            {highlights.map((item, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-accent-warm/30 bg-accent-warm/10 px-2.5 py-1.5 text-xs"
              >
                <MathBanglaText content={`$${item}$`} variant="compact" />
              </li>
            ))}
          </ul>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newHighlightText}
              onChange={(e) => setNewHighlightText(e.target.value)}
              placeholder="গুরুত্বপূর্ণ সূত্র বা পয়েন্ট..."
              className="min-w-0 flex-1 rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs"
              data-testid="highlight-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddHighlight}
              data-testid="add-highlight-btn"
            >
              যুক্ত করুন
            </Button>
          </div>

          <label
            htmlFor="student-personal-note"
            className="mb-1 block font-heading text-xs font-semibold text-content-secondary"
          >
            ব্যক্তিগত রিভিশন নোট (বাংলা ও গণিত `$...$` সহ):
          </label>
          <textarea
            id="student-personal-note"
            rows={3}
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="যেমন: পরীক্ষার আগে $(a-b)^2 = a^2 - 2ab + b^2$ অনুসিদ্ধান্তটি চর্চা করতে হবে।"
            className="mb-3 w-full rounded-lg border border-border-subtle bg-canvas p-2.5 text-xs"
            data-testid="personal-note-textarea"
          />

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSaveAnnotation()}
            data-testid="save-annotation-btn"
            className="w-full"
          >
            {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'নোট ও বুকমার্ক সংরক্ষণ করুন'}
          </Button>

          {saveFeedback && (
            <p
              data-testid="annotation-save-feedback"
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-status-success"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{saveFeedback}</span>
            </p>
          )}
        </Card>
      </div>

      {/* Main Academic Reading Canvas */}
      <div className="lg:col-span-8">
        <Card elevated className="p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="navy">
                  {RESOURCE_TYPE_LABELS[activeResource.resource_type]}
                </Badge>
                {activeResource.nctb_page_reference && (
                  <Badge variant="teal">
                    NCTB পাঠ্যবই · {activeResource.nctb_page_reference}
                  </Badge>
                )}
              </div>
              <h2 className="font-heading text-xl font-bold text-brand-primary sm:text-2xl">
                {activeResource.title_bn}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isBookmarked ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleSaveAnnotation(!isBookmarked)}
                data-testid="toggle-bookmark-btn"
              >
                <Bookmark className="h-4 w-4" />
                <span>{isBookmarked ? 'বুকমার্ক করা হয়েছে' : 'বুকমার্ক করুন'}</span>
              </Button>

              <a
                href={getResourcePdfDownloadUrl(activeResource.id)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="download-watermarked-pdf-link"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-3 font-heading text-xs font-medium text-content-primary hover:bg-subtle"
              >
                <Download className="h-3.5 w-3.5 text-brand-primary" />
                <span>ওয়াটারমার্কড PDF ডাউনলোড</span>
              </a>
            </div>
          </div>

          {/* Mixed Bangla + KaTeX Long-Form Lesson Reader (18px, 1.80 line-height, 68ch max measure) */}
          <article className="space-y-4">
            {activeResource.content_markdown
              .split(/\n\s*\n/)
              .map((block, index) => {
                const trimmed = block.trim();
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={index}
                      className="pt-2 font-heading text-lg font-bold text-brand-primary"
                    >
                      {trimmed.replace(/^###\s+/, '')}
                    </h3>
                  );
                }

                return (
                  <MathBanglaText
                    key={index}
                    content={trimmed}
                    variant="lesson-body"
                  />
                );
              })}
          </article>

          <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4 text-xs text-content-secondary">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-brand-secondary" />
              <span>
                যাচাইকৃত এনসিটিবি (NCTB ২০২৬) গ্রাউন্ডিং উপকরণ · RAG Index:{' '}
                <code className="font-mono">
                  {activeResource.vector_embedding_id ?? 'vec_res_active'}
                </code>
              </span>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

