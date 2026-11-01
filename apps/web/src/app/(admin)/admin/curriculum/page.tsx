import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AdminCurriculumCmsWorkspace } from '@/features/admin-cms/components/AdminCurriculumCmsWorkspace';
import type {
  LearningObjectiveDto,
  LearningResourceDto,
} from '@/features/curriculum/types/curriculum.types';

const INITIAL_OBJECTIVES: LearningObjectiveDto[] = [
  {
    id: 1,
    topic_id: 1,
    code: 'C8-MATH-CH4-T1-LO1',
    title_bn:
      'দ্বিপদী ও ত্রিপদী রাশির বর্গ নির্ণয়ে $(a+b)^2$ এবং $(a-b)^2$ সূত্র প্রয়োগ করতে পারবে',
    title_en:
      'Apply (a+b)^2 and (a-b)^2 formulas to expand binomial and trinomial squares',
    bloom_level: 'application',
    mastery_threshold_pct: 75,
    sort_order: 1,
    prerequisites: [
      {
        id: 10,
        code: 'C7-MATH-CH5-T1-LO1',
        title_bn: 'প্রথম ও দ্বিতীয় সূত্রের সাহায্যে দ্বিপদী রাশির বর্গ নির্ণয়',
        title_en: 'Square of binomial expressions',
      },
    ],
  },
  {
    id: 2,
    topic_id: 1,
    code: 'C8-MATH-CH4-T1-LO2',
    title_bn:
      'বর্গের অনুসিদ্ধান্ত ব্যবহার করে বীজগণিতীয় রাশির মান নির্ণয় ও প্রমাণ করতে পারবে',
    title_en: 'Evaluate and prove algebraic expressions using square corollaries',
    bloom_level: 'higher_order',
    mastery_threshold_pct: 75,
    sort_order: 2,
    prerequisites: [
      {
        id: 1,
        code: 'C8-MATH-CH4-T1-LO1',
        title_bn: 'দ্বিপদী রাশির বর্গ নির্ণয়',
        title_en: 'Binomial square expansion',
      },
    ],
  },
];

const INITIAL_CMS_RESOURCES: LearningResourceDto[] = [
  {
    id: 101,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 1,
    resource_type: 'lesson_note',
    title_bn: 'পাঠ নোট: দ্বিপদী রাশির বর্গ নির্ণয়ের সূত্র ও জ্যামিতিক ব্যাখ্যা',
    content_markdown: '$$(a + b)^2 = a^2 + 2ab + b^2$$',
    nctb_page_reference: 'পৃষ্ঠা ৪৭–৫২',
    workflow_status: 'published',
    reviewed_by: 1,
    reviewed_at: '2026-11-01T10:00:00Z',
    published_at: '2026-11-01T10:05:00Z',
    vector_embedding_id: 'vec_res_101_v2',
  },
  {
    id: 102,
    curriculum_version_id: 1,
    chapter_id: 4,
    topic_id: 1,
    learning_objective_id: 2,
    resource_type: 'worked_example',
    title_bn: 'সমাধানকৃত উদাহরণ: বর্গের অনুসিদ্ধান্তের সাহায্যে মান নির্ণয়',
    content_markdown:
      'দেওয়া আছে $a - b = 4$ এবং $ab = 21$ হলে $(a + b)^2 = (a - b)^2 + 4ab = 16 + 84 = 100$।',
    nctb_page_reference: 'পৃষ্ঠা ৫০',
    workflow_status: 'draft',
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    vector_embedding_id: null,
  },
];

export default function AdminCurriculumCmsPage(): React.ReactElement {
  return (
    <AppShell
      title="অ্যাডমিন ও কনটেন্ট রিভিউয়ার সিএমএস · NCTB ২০২৬"
      subtitle="পাঠ্যক্রম বৃক্ষ, পূর্বশর্ত গ্রাফ (DAG), বাংলা + KaTeX এডিটর এবং অনুমোদন ওয়ার্কফ্লো"
    >
      <AdminCurriculumCmsWorkspace
        curriculumVersionId={1}
        curriculumVersionCode="NCTB-2026-BM-v1.0"
        chapterId={4}
        chapterTitleBn="অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ"
        objectives={INITIAL_OBJECTIVES}
        initialResources={INITIAL_CMS_RESOURCES}
      />
    </AppShell>
  );
}

