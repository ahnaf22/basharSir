import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  GUARDIAN_NAV,
  GUARDIAN_TABS,
  STUDENT_NAV,
  STUDENT_TABS,
  isNavActive,
  searchCurriculum,
} from '../desk-nav';

const APP_DIR = join(process.cwd(), 'src', 'app');

/** A menu link is only valid if a page file exists for it in one of the route groups. */
function hasPage(href: string): boolean {
  const segments = href.replace(/^\//, '');
  return ['(student)', '(parent)', '(public)', ''].some((group) =>
    existsSync(join(APP_DIR, group, segments, 'page.tsx')),
  );
}

describe('desk navigation', () => {
  it('every sidebar and tab-bar link opens a real page', () => {
    const hrefs = [
      ...STUDENT_NAV.flatMap((g) => g.items),
      ...GUARDIAN_NAV.flatMap((g) => g.items),
      ...STUDENT_TABS,
      ...GUARDIAN_TABS,
    ].map((i) => i.href);

    const missing = hrefs.filter((h) => !hasPage(h));
    expect(missing).toEqual([]);
  });

  it('has no duplicate links inside one sidebar', () => {
    for (const nav of [STUDENT_NAV, GUARDIAN_NAV]) {
      const hrefs = nav.flatMap((g) => g.items.map((i) => i.href));
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it('marks a route active on an exact match or when nested under it', () => {
    expect(isNavActive('/planner', '/planner')).toBe(true);
    expect(isNavActive('/parent/children/42', '/parent/children')).toBe(true);
    expect(isNavActive('/planner-old', '/planner')).toBe(false);
    expect(isNavActive(null, '/home')).toBe(false);
  });
});

describe('searchCurriculum', () => {
  const curriculum = {
    subjects: [
      {
        title_bn: 'গণিত',
        chapters: [
          {
            id: 4,
            chapter_number: 4,
            title_bn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
            title_en: 'Algebraic Formulas',
            topics: [{ id: 9, title_bn: 'বর্গের সূত্র' }],
          },
          { id: 5, chapter_number: 6, title_bn: 'সরল সহসমীকরণ', title_en: 'Simultaneous Equations', topics: [] },
        ],
      },
    ],
  };

  it('matches chapter titles (Bangla or English) and topic titles, linking back to the chapter', () => {
    expect(searchCurriculum(curriculum, 'সহসমীকরণ')).toEqual([
      { key: 'c5', chapterId: 5, label: 'অধ্যায় ৬: সরল সহসমীকরণ', sub: 'গণিত' },
    ]);
    expect(searchCurriculum(curriculum, 'algebraic')[0]).toMatchObject({ chapterId: 4 });
    expect(searchCurriculum(curriculum, 'বর্গের')[0]).toMatchObject({
      key: 't9',
      chapterId: 4,
      sub: 'গণিত › বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
    });
  });

  it('returns nothing for an empty query or before the curriculum has loaded', () => {
    expect(searchCurriculum(curriculum, '  ')).toEqual([]);
    expect(searchCurriculum(undefined, 'গণিত')).toEqual([]);
  });
});
