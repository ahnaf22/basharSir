import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StudyMaterialsReader } from '@/features/curriculum/components/StudyMaterialsReader';
import type { LearningResourceDto } from '@/features/curriculum/types/curriculum.types';

const INITIAL_PUBLISHED_RESOURCES: LearningResourceDto[] = [
  {
    id: 1,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 1,
    resource_type: 'lesson_note',
    title_bn: 'পাঠ নোট: দ্বিপদী রাশির বর্গ নির্ণয়ের সূত্র ও জ্যামিতিক ব্যাখ্যা',
    content_markdown: [
      '### সূত্র ১: দুইটি রাশির যোগফলের বর্গ',
      'দুইটি রাশির যোগফলের বর্গ সমান প্রথম রাশির বর্গ যোগ দুই গুণ প্রথম রাশি গুণ দ্বিতীয় রাশি যোগ দ্বিতীয় রাশির বর্গ:\n\n$$(a + b)^2 = a^2 + 2ab + b^2$$',
      '### সূত্র ২: দুইটি রাশির বিয়োগফলের বর্গ',
      'দুইটি রাশির বিয়োগফলের বর্গ সমান প্রথম রাশির বর্গ বিয়োগ দুই গুণ প্রথম রাশি গুণ দ্বিতীয় রাশি যোগ দ্বিতীয় রাশির বর্গ:\n\n$$(a - b)^2 = a^2 - 2ab + b^2$$',
      '### সমাধানকৃত উদাহরণ',
      'প্রশ্ন: $(3x + 5y)^2$ এর বর্গ নির্ণয় করো। সমাধান: এখানে প্রথম পদ $a = 3x$ এবং দ্বিতীয় পদ $b = 5y$। অতএব, $(3x + 5y)^2 = (3x)^2 + 2(3x)(5y) + (5y)^2 = 9x^2 + 30xy + 25y^2$।',
    ].join('\n\n'),
    nctb_page_reference: 'পৃষ্ঠা ৪৭–৫২',
    workflow_status: 'published',
    reviewed_by: 1,
    reviewed_at: '2026-11-01T10:00:00Z',
    published_at: '2026-11-01T10:05:00Z',
    vector_embedding_id: 'vec_res_1_v3',
    rag_chunks_count: 3,
  },
  {
    id: 2,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 1,
    resource_type: 'formula_sheet',
    title_bn: 'সূত্র তালিকা: অধ্যায় ৪ (বীজগণিতীয় বর্গ ও অনুসিদ্ধান্ত)',
    content_markdown: [
      '### বর্গের মূল সূত্র ও অনুসিদ্ধান্তসমূহ',
      '১. $(a + b)^2 = a^2 + 2ab + b^2$ এবং $(a - b)^2 = a^2 - 2ab + b^2$',
      '২. $a^2 - b^2 = (a + b)(a - b)$',
      '৩. অনুসিদ্ধান্ত: $a^2 + b^2 = (a + b)^2 - 2ab = (a - b)^2 + 2ab$',
      '৪. অনুসিদ্ধান্ত: $4ab = (a + b)^2 - (a - b)^2$',
    ].join('\n\n'),
    nctb_page_reference: 'পৃষ্ঠা ৪৮–৫৪',
    workflow_status: 'published',
    reviewed_by: 1,
    reviewed_at: '2026-11-01T10:00:00Z',
    published_at: '2026-11-01T10:05:00Z',
    vector_embedding_id: 'vec_res_2_v2',
    rag_chunks_count: 2,
  },
];

export default function StudentStudyMaterialsPage(): React.ReactElement {
  return (
    <AppShell
      title="পাঠ্য উপকরণ ও নোট খাতা · অষ্টম শ্রেণি গণিত"
      subtitle="এনসিটিবি (NCTB ২০২৬) অনুমোদিত পাঠ নোট, সূত্র তালিকা, ব্যক্তিগত হাইলাইট ও ওয়াটারমার্কড PDF"
    >
      <StudyMaterialsReader
        chapterNumber={4}
        chapterTitleBn="বীজগণিতীয় সূত্রাবলি ও প্রয়োগ"
        resources={INITIAL_PUBLISHED_RESOURCES}
      />
    </AppShell>
  );
}

