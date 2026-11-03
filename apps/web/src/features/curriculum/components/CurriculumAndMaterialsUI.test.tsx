import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminCurriculumCmsWorkspace } from '@/features/admin-cms/components/AdminCurriculumCmsWorkspace';
import { StudyMaterialsReader } from '@/features/curriculum/components/StudyMaterialsReader';
import type {
  LearningObjectiveDto,
  LearningResourceDto,
} from '@/features/curriculum/types/curriculum.types';

const SAMPLE_RESOURCES: LearningResourceDto[] = [
  {
    id: 11,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 1,
    resource_type: 'lesson_note',
    title_bn: 'পাঠ নোট: দ্বিপদী রাশির বর্গ নির্ণয়',
    content_markdown: 'সূত্র: $$(a + b)^2 = a^2 + 2ab + b^2$$',
    nctb_page_reference: 'পৃষ্ঠা ৪৭',
    workflow_status: 'published',
    reviewed_by: 1,
    reviewed_at: '2026-11-01T10:00:00Z',
    published_at: '2026-11-01T10:05:00Z',
    vector_embedding_id: 'vec_res_11_v1',
  },
  {
    id: 12,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 1,
    resource_type: 'formula_sheet',
    title_bn: 'সূত্র তালিকা: অধ্যায় ৪',
    content_markdown: 'অনুসিদ্ধান্ত: $4ab = (a+b)^2 - (a-b)^2$',
    nctb_page_reference: 'পৃষ্ঠা ৪৯',
    workflow_status: 'draft',
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    vector_embedding_id: null,
  },
];

const SAMPLE_OBJECTIVES: LearningObjectiveDto[] = [
  {
    id: 1,
    topic_id: 1,
    code: 'C8-MATH-CH4-T1-LO1',
    title_bn: 'দ্বিপদী রাশির বর্গ নির্ণয়ে $(a+b)^2$ সূত্র প্রয়োগ করতে পারবে',
    title_en: 'Apply (a+b)^2 formula',
    bloom_level: 'application',
    mastery_threshold_pct: 75,
    sort_order: 1,
    prerequisites: [
      {
        id: 10,
        code: 'C7-MATH-CH5-T1-LO1',
        title_bn: 'সপ্তম শ্রেণির বর্গ সূত্র',
        title_en: 'Class 7 square formula',
      },
    ],
  },
];

describe('StudyMaterialsReader & AdminCurriculumCmsWorkspace UI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Bangla + KaTeX study materials, switches resources, and saves student bookmarks/notes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: 'আপনার বুকমার্ক ও ব্যক্তিগত নোট সংরক্ষিত হয়েছে।',
          data: {
            id: 1,
            learning_resource_id: 11,
            is_bookmarked: true,
            highlights: ['(a + b)^2 = a^2 + 2ab + b^2'],
            personal_note_markdown: 'খুব গুরুত্বপূর্ণ সূত্র।',
          },
          meta: { correlation_id: 'req_ann_1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <StudyMaterialsReader
        chapterNumber={4}
        chapterTitleBn="বীজগণিতীয় সূত্রাবলি ও প্রয়োগ"
        resources={SAMPLE_RESOURCES}
      />
    );

    expect(
      screen.getAllByText('পাঠ নোট: দ্বিপদী রাশির বর্গ নির্ণয়').length
    ).toBeGreaterThan(0);

    const pdfLink = screen.getByTestId('download-watermarked-pdf-link');
    expect(pdfLink.getAttribute('href')).toContain('/resources/11/pdf');

    fireEvent.change(screen.getByTestId('personal-note-textarea'), {
      target: { value: 'খুব গুরুত্বপূর্ণ সূত্র।' },
    });
    fireEvent.click(screen.getByTestId('toggle-bookmark-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('annotation-save-feedback')).toHaveTextContent(
        'আপনার বুকমার্ক ও ব্যক্তিগত নোট সংরক্ষিত হয়েছে।'
      );
    });
  });

  it('renders Admin Curriculum CMS live KaTeX preview and transitions Draft -> In Review -> Approved -> Published', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          success: true,
          message: 'পাঠ্য উপকরণের ওয়ার্কফ্লো অবস্থা সফলভাবে হালনাগাদ করা হয়েছে।',
          data: {
            ...SAMPLE_RESOURCES[1],
            workflow_status: 'in_review',
          },
          meta: { correlation_id: 'req_wf_1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AdminCurriculumCmsWorkspace
        curriculumVersionId={1}
        curriculumVersionCode="NCTB-2026-BM-v1.0"
        chapterId={4}
        chapterTitleBn="অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ"
        objectives={SAMPLE_OBJECTIVES}
        initialResources={SAMPLE_RESOURCES}
      />
    );

    expect(screen.getByText('C8-MATH-CH4-T1-LO1')).toBeInTheDocument();
    expect(screen.getByText('C7-MATH-CH5-T1-LO1')).toBeInTheDocument();

    const preview = screen.getByTestId('cms-live-preview');
    await waitFor(() => expect(preview.querySelector('.katex')).not.toBeNull());

    // Click "রিভিউয়ে পাঠান (In Review)" on Draft resource #12
    fireEvent.click(screen.getByTestId('transition-in-review-12'));

    await waitFor(() => {
      expect(
        screen.getByText('পর্যালোচনাধীন (In Review)')
      ).toBeInTheDocument();
    });
  });
});

