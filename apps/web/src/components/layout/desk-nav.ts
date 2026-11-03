import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';

/** Icon ids that exist in the shell's SVG sprite (`#i-<name>`). */
export type DeskIcon =
  | 'home'
  | 'tutor'
  | 'cal'
  | 'book'
  | 'test'
  | 'khata'
  | 'chart'
  | 'group'
  | 'teacher'
  | 'family'
  | 'card'
  | 'more';

export interface DeskNavItem {
  href: string;
  label: string;
  icon: DeskIcon;
  /** Small chip on the right of the sidebar row. */
  pill?: { text: string; isNew?: boolean };
}

export interface DeskNavGroup {
  /** Group heading; the first group has none. */
  label?: string;
  items: DeskNavItem[];
}

/** Sidebar for a student. Every href is a real route under `src/app/(student)`. */
export const STUDENT_NAV: DeskNavGroup[] = [
  {
    items: [
      { href: '/home', label: 'আজ', icon: 'home' },
      { href: '/tutor', label: 'AI Tutor', icon: 'tutor' },
      { href: '/planner', label: 'পড়ার রুটিন', icon: 'cal' },
    ],
  },
  {
    label: 'পড়া',
    items: [
      { href: '/materials', label: 'বই ও নোট', icon: 'book' },
      { href: '/exams', label: 'মডেল টেস্ট', icon: 'test' },
      { href: '/scripts', label: 'খাতা মূল্যায়ন', icon: 'khata', pill: { text: 'নতুন', isNew: true } },
      { href: '/analytics', label: 'অগ্রগতি', icon: 'chart' },
    ],
  },
  {
    label: 'একসাথে',
    items: [
      { href: '/group-learning', label: 'পড়ার আড্ডা', icon: 'group', pill: { text: '৩–৫ জন' } },
      { href: '/teachers', label: 'শিক্ষক বুকিং', icon: 'teacher' },
    ],
  },
];

/** Sidebar for a guardian: the parent portal routes under `src/app/(parent)`. */
export const GUARDIAN_NAV: DeskNavGroup[] = [
  {
    items: [
      { href: '/parent/dashboard', label: 'অভিভাবক ড্যাশবোর্ড', icon: 'home' },
      { href: '/parent/children', label: 'সন্তান ও সম্মতি', icon: 'family' },
    ],
  },
  {
    label: 'অ্যাকাউন্ট',
    items: [
      { href: '/parent/billing', label: 'প্যাকেজ ও বিলিং', icon: 'card' },
      { href: '/teachers', label: 'শিক্ষক বুকিং', icon: 'teacher' },
    ],
  },
];

export interface DeskTab extends DeskNavItem {
  /** The centre "Tutor" tab is raised in the mobile bar. */
  raised?: boolean;
}

/** Four direct tabs; the fifth, "আরও", opens a sheet with the full menu. */
export const STUDENT_TABS: DeskTab[] = [
  { href: '/home', label: 'আজ', icon: 'home' },
  { href: '/planner', label: 'রুটিন', icon: 'cal' },
  { href: '/tutor', label: 'Tutor', icon: 'tutor', raised: true },
  { href: '/exams', label: 'টেস্ট', icon: 'test' },
];

export const GUARDIAN_TABS: DeskTab[] = [
  { href: '/parent/dashboard', label: 'আজ', icon: 'home' },
  { href: '/parent/children', label: 'সন্তান', icon: 'family' },
  { href: '/parent/billing', label: 'বিলিং', icon: 'card' },
  { href: '/teachers', label: 'শিক্ষক', icon: 'teacher' },
];

/** A route is active on an exact match or when it is a parent of the current path. */
export function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ---- top-bar search over the student's own curriculum ---- */

interface SearchableCurriculum {
  subjects: Array<{
    title_bn: string;
    chapters: Array<{
      id: number;
      chapter_number: number;
      title_bn: string;
      title_en: string;
      topics: Array<{ id: number; title_bn: string }>;
    }>;
  }>;
}

export interface DeskSearchHit {
  key: string;
  chapterId: number;
  label: string;
  sub: string;
}

/** Chapters and topics whose Bangla/English title contains the query (max 6). */
export function searchCurriculum(
  curriculum: SearchableCurriculum | undefined,
  query: string,
): DeskSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q || !curriculum) return [];
  const hits: DeskSearchHit[] = [];
  for (const subject of curriculum.subjects) {
    for (const chapter of subject.chapters) {
      if (chapter.title_bn.toLowerCase().includes(q) || chapter.title_en.toLowerCase().includes(q)) {
        hits.push({
          key: `c${chapter.id}`,
          chapterId: chapter.id,
          label: `অধ্যায় ${toBanglaNumerals(chapter.chapter_number)}: ${chapter.title_bn}`,
          sub: subject.title_bn,
        });
      }
      for (const topic of chapter.topics) {
        if (topic.title_bn.toLowerCase().includes(q)) {
          hits.push({
            key: `t${topic.id}`,
            chapterId: chapter.id,
            label: topic.title_bn,
            sub: `${subject.title_bn} › ${chapter.title_bn}`,
          });
        }
      }
    }
  }
  return hits.slice(0, 6);
}
