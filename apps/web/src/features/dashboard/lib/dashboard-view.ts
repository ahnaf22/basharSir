import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import type {
  DashboardTaskDto,
  DashboardWeekDayDto,
  StudentDashboardDto,
} from '../api/student-dashboard.api';

/** The five student-facing lesson steps; backend tutor states fold into these. */
export const LESSON_STEPS = [
  'শুরুর আগে: আগের পড়া ঝালাই',
  'ধারণা',
  'উদাহরণ',
  'নিজে করো',
  'ছোট কুইজ',
] as const;

export function getStageIndex(stage?: string | null): number {
  switch (stage) {
    case 'TEACH_PREREQUISITE':
    case 'EXPLAIN_CONCEPT':
      return 1;
    case 'WORKED_EXAMPLE':
      return 2;
    case 'ASK_STUDENT_QUESTION':
    case 'IDENTIFY_MISCONCEPTION':
    case 'INCREASE_DIFFICULTY':
      return 3;
    case 'MINI_ASSESSMENT':
    case 'SAVE_PROGRESS':
      return 4;
    default:
      return 0; // START_LESSON, CHECK_PREREQUISITES, unknown
  }
}

const WEEKDAY_LABELS: Record<number, { short: string; full: string }> = {
  6: { short: 'শ', full: 'শনিবার' },
  0: { short: 'র', full: 'রবিবার' },
  1: { short: 'সো', full: 'সোমবার' },
  2: { short: 'ম', full: 'মঙ্গলবার' },
  3: { short: 'বু', full: 'বুধবার' },
  4: { short: 'বৃ', full: 'বৃহস্পতিবার' },
  5: { short: 'শু', full: 'শুক্রবার' },
};

export function weekdayShort(weekday: number): string {
  return WEEKDAY_LABELS[weekday]?.short ?? '';
}

/** Screen-reader summary, e.g. "এই সপ্তাহ: শনিবার, রবিবার পড়া হয়েছে, আজ সোমবার চলছে". */
export function describeWeek(week: DashboardWeekDayDto[]): string {
  const studied = week
    .filter((d) => d.studied && !d.is_today)
    .map((d) => WEEKDAY_LABELS[d.weekday]?.full)
    .filter(Boolean);
  const today = week.find((d) => d.is_today);
  const parts: string[] = [];
  if (studied.length > 0) parts.push(`${studied.join(', ')} পড়া হয়েছে`);
  if (today) {
    const name = WEEKDAY_LABELS[today.weekday]?.full ?? 'আজ';
    parts.push(today.studied ? `আজ ${name} পড়া হয়েছে` : `আজ ${name} চলছে`);
  }
  return `এই সপ্তাহ: ${parts.join(', ')}`;
}

const MEDIUM_LABELS: Record<string, string> = {
  bangla: 'বাংলা মিডিয়াম',
  english_version: 'ইংরেজি ভার্সন',
  english_medium: 'ইংরেজি মিডিয়াম',
  madrasa: 'মাদ্রাসা',
};

export function mediumLabelBn(medium?: string | null): string {
  return (medium && MEDIUM_LABELS[medium]) || MEDIUM_LABELS.bangla!;
}

export const TASK_TYPE_LABELS: Record<string, string> = {
  prerequisite_remedial: 'আগের পড়া ঝালাই',
  revision: 'রিভিশন',
  concept_lesson: 'নতুন পাঠ',
  guided_practice: 'অনুশীলন',
  chapter_quiz: 'অধ্যায়ের কুইজ',
};

/** "৮:১৫" style 12-hour clock (no am/pm: the routine is a same-day list). */
export function formatClockBn(date: Date): string {
  const h = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
  const m = date.getMinutes();
  return toBanglaNumerals(`${h}:${String(m).padStart(2, '0')}`);
}

/**
 * Time column for the routine list. Nothing is stored per-task, so times are derived:
 * the first unfinished task is "এখন", each later one starts when the previous planned
 * minutes run out (rounded up to 5 minutes). Finished tasks read "শেষ".
 */
export function buildRoutineTimes(
  tasks: DashboardTaskDto[],
  doneIds: ReadonlySet<number>,
  now: Date,
): string[] {
  let cursor = new Date(now.getTime());
  let seenPending = false;
  return tasks.map((task) => {
    if (doneIds.has(task.id)) return 'শেষ';
    if (!seenPending) {
      seenPending = true;
      cursor = new Date(cursor.getTime() + task.estimated_minutes * 60_000);
      return 'এখন';
    }
    const start = new Date(cursor.getTime());
    const rounded = Math.ceil(start.getMinutes() / 5) * 5;
    start.setMinutes(rounded, 0, 0);
    cursor = new Date(start.getTime() + task.estimated_minutes * 60_000);
    return formatClockBn(start);
  });
}

export function taskDetailLine(task: DashboardTaskDto): string {
  const parts = [`${toBanglaNumerals(task.estimated_minutes)} মিনিট`];
  const label = task.task_type ? TASK_TYPE_LABELS[task.task_type] : undefined;
  if (label) parts.push(label);
  if (task.chapter_title_bn) parts.push(task.chapter_title_bn);
  return parts.join(' · ');
}

export interface HeroLesson {
  subject: string;
  chapterNumber: number;
  chapter: string;
  title: string;
  /** href for the primary button */
  href: string;
  cta: string;
  eta: string | null;
  stageIndex: number;
  isResume: boolean;
  sessionId: number | null;
}

/** Chooses what the bright "now" card shows: resume > start planned > nothing. */
export function pickHeroLesson(data: StudentDashboardDto | undefined): HeroLesson | null {
  if (!data) return null;
  const c = data.continue_lesson;
  if (c) {
    return {
      subject: c.subject_title_bn,
      chapterNumber: c.chapter_number,
      chapter: c.chapter_title_bn,
      title: c.title_bn,
      href: `/tutor?session_id=${c.session_id}`,
      cta: 'পাঠ চালিয়ে যাও',
      eta:
        c.estimated_remaining_minutes !== null
          ? `আর আনুমানিক ${toBanglaNumerals(c.estimated_remaining_minutes)} মিনিট`
          : null,
      stageIndex: getStageIndex(c.current_stage),
      isResume: true,
      sessionId: c.session_id,
    };
  }
  const n = data.next_lesson;
  if (n) {
    return {
      subject: n.subject_title_bn,
      chapterNumber: n.chapter_number,
      chapter: n.chapter_title_bn,
      title: n.title_bn,
      href: `/tutor?objective_id=${n.learning_objective_id}`,
      cta: 'পাঠ শুরু করো',
      eta: `আনুমানিক ${toBanglaNumerals(n.estimated_minutes)} মিনিট`,
      stageIndex: 0,
      isResume: false,
      sessionId: null,
    };
  }
  return null;
}

export interface GoalProgress {
  minutes: number;
  target: number;
  remaining: number;
  /** 0..1 */
  fraction: number;
}

export function computeGoalProgress(activeMinutes: number, targetMinutes: number): GoalProgress {
  const target = Math.max(1, Math.round(targetMinutes));
  const minutes = Math.max(0, Math.round(activeMinutes));
  return {
    minutes,
    target,
    remaining: Math.max(0, target - minutes),
    fraction: Math.min(1, minutes / target),
  };
}

export interface BadgeView {
  key: number | string;
  title: string;
  subtitle: string | null;
  kind: 'streak' | 'star';
  /** Glyph text drawn inside the badge, already in Bangla digits. */
  glyph: string;
}

/** "ধারাবাহিক সাধক (৩ দিনের স্ট্রিক)" → title + subtitle; code decides the glyph. */
export function toBadgeView(badge: { id: number; badge_code: string; title_bn: string }): BadgeView {
  const match = badge.title_bn.match(/^(.*?)\s*\((.+)\)\s*$/);
  const title = match?.[1] ?? badge.title_bn;
  const subtitle = match?.[2] ?? null;
  const streak = badge.badge_code.match(/^BADGE_STREAK_(\d+)D$/);
  if (streak) {
    return { key: badge.id, title, subtitle, kind: 'streak', glyph: toBanglaNumerals(streak[1] ?? '') };
  }
  // "৫০+ এক্সপি অর্জিত" → the starburst shows "৫০+", like the design; otherwise a plain star
  const lead = subtitle?.match(/^([0-9০-৯]+\+?)/);
  return { key: badge.id, title, subtitle, kind: 'star', glyph: lead?.[1] ? toBanglaNumerals(lead[1]) : '★' };
}

/** Plan names arrive as "ফ্যামিলি প্যাক (Family — সর্বোচ্চ ৪ সন্তান)"; the sidebar wants just the name. */
export function shortPlanName(nameBn: string): string {
  return nameBn.replace(/\s*\(.*\)\s*$/, '').trim() || nameBn;
}

/**
 * Avatar initial: the first grapheme, not the first code point, so "রাফি" gives "রা" (not a bare "র")
 * and conjunct-initial names are never cut in the middle of a letter.
 */
export function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const first = new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(trimmed)[Symbol.iterator]().next();
    if (!first.done) return first.value.segment;
  }
  return Array.from(trimmed)[0] ?? '';
}

/** Block states for one subject row, trimmed with a "+N" overflow hint. */
export function masteryHeadline(total: number, mastered: number): string {
  return `${toBanglaNumerals(total)}টি শিখনফলের ${toBanglaNumerals(mastered)}টি পোক্ত`;
}
