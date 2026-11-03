import { describe, it, expect } from 'vitest';
import {
  buildRoutineTimes,
  computeGoalProgress,
  describeWeek,
  getStageIndex,
  mediumLabelBn,
  pickHeroLesson,
  toBadgeView,
  avatarInitial,
  shortPlanName,
} from '../lib/dashboard-view';
import type { DashboardTaskDto, StudentDashboardDto } from '../api/student-dashboard.api';

const task = (id: number, minutes: number): DashboardTaskDto => ({
  id,
  title_bn: `কাজ ${id}`,
  subject_title_bn: 'গণিত',
  estimated_minutes: minutes,
  status: 'scheduled',
  learning_objective_id: id,
});

describe('getStageIndex', () => {
  it('folds backend tutor states into the five student-facing steps', () => {
    expect(getStageIndex('CHECK_PREREQUISITES')).toBe(0);
    expect(getStageIndex('EXPLAIN_CONCEPT')).toBe(1);
    expect(getStageIndex('WORKED_EXAMPLE')).toBe(2);
    expect(getStageIndex('IDENTIFY_MISCONCEPTION')).toBe(3);
    expect(getStageIndex('MINI_ASSESSMENT')).toBe(4);
    expect(getStageIndex(undefined)).toBe(0);
  });
});

describe('buildRoutineTimes', () => {
  it('marks the first pending task now, derives later start times and marks finished ones', () => {
    const now = new Date(2026, 10, 2, 7, 52); // 7:52
    const tasks = [task(1, 25), task(2, 20), task(3, 10)];
    // task 1 is "now" and ends 8:17; task 2 starts 8:20 (rounded up to 5 min) and runs to 8:40
    expect(buildRoutineTimes(tasks, new Set(), now)).toEqual(['এখন', '৮:২০', '৮:৪০']);
    expect(buildRoutineTimes(tasks, new Set([1]), now)).toEqual(['শেষ', 'এখন', '৮:১৫']);
  });
});

describe('computeGoalProgress', () => {
  it('clamps the ring fraction and never reports negative remaining time', () => {
    expect(computeGoalProgress(30, 45)).toMatchObject({ remaining: 15, fraction: 30 / 45 });
    expect(computeGoalProgress(80, 45)).toMatchObject({ remaining: 0, fraction: 1 });
    expect(computeGoalProgress(0, 0).target).toBe(1);
  });
});

describe('describeWeek', () => {
  it('names studied days and today for screen readers', () => {
    const text = describeWeek([
      { date: '2026-10-31', weekday: 6, studied: true, is_today: false },
      { date: '2026-11-01', weekday: 0, studied: true, is_today: false },
      { date: '2026-11-02', weekday: 1, studied: false, is_today: true },
    ]);
    expect(text).toBe('এই সপ্তাহ: শনিবার, রবিবার পড়া হয়েছে, আজ সোমবার চলছে');
  });
});

describe('toBadgeView', () => {
  it('splits the subtitle and picks a glyph from the badge code', () => {
    expect(toBadgeView({ id: 1, badge_code: 'BADGE_STREAK_3D', title_bn: 'ধারাবাহিক সাধক (৩ দিনের স্ট্রিক)' })).toMatchObject({
      title: 'ধারাবাহিক সাধক',
      subtitle: '৩ দিনের স্ট্রিক',
      kind: 'streak',
      glyph: '৩',
    });
    expect(toBadgeView({ id: 2, badge_code: 'BADGE_SCHOLAR_STARTER', title_bn: 'উদ্যমী শিক্ষার্থী' })).toMatchObject({
      subtitle: null,
      kind: 'star',
    });
  });
});

describe('badge glyph for XP badges', () => {
  it('shows the leading number of the subtitle in the starburst', () => {
    expect(toBadgeView({ id: 3, badge_code: 'BADGE_SCHOLAR_STARTER', title_bn: 'উদ্যমী শিক্ষার্থী (৫০+ এক্সপি অর্জিত)' })).toMatchObject({
      title: 'উদ্যমী শিক্ষার্থী',
      kind: 'star',
      glyph: '৫০+',
    });
  });
});

describe('shortPlanName', () => {
  it('drops the bilingual parenthetical', () => {
    expect(shortPlanName('ফ্যামিলি প্যাক (Family — সর্বোচ্চ ৪ সন্তান)')).toBe('ফ্যামিলি প্যাক');
    expect(shortPlanName('ফ্রি')).toBe('ফ্রি');
  });
});

describe('avatarInitial', () => {
  it('keeps the first whole Bangla letter with its vowel sign', () => {
    expect(avatarInitial('রাফি')).toBe('রা');
    expect(avatarInitial('  ')).toBe('');
  });
});

describe('mediumLabelBn', () => {
  it('labels each medium and falls back to Bangla medium', () => {
    expect(mediumLabelBn('madrasa')).toBe('মাদ্রাসা');
    expect(mediumLabelBn(undefined)).toBe('বাংলা মিডিয়াম');
  });
});

describe('pickHeroLesson', () => {
  const base = { continue_lesson: null, next_lesson: null } as unknown as StudentDashboardDto;

  it('prefers resuming the open tutor session', () => {
    const hero = pickHeroLesson({
      ...base,
      continue_lesson: {
        session_id: 9,
        session_uuid: 'u',
        current_stage: 'EXPLAIN_CONCEPT',
        learning_objective_id: 4,
        title_bn: 'শিরোনাম',
        chapter_title_bn: 'অধ্যায়',
        chapter_number: 3,
        subject_title_bn: 'গণিত',
        active_duration_seconds: 60,
        estimated_remaining_minutes: null,
      },
    });
    expect(hero).toMatchObject({ isResume: true, href: '/tutor?session_id=9', eta: null, stageIndex: 1 });
  });

  it('starts the next planned objective when no session is open, and is null with nothing planned', () => {
    const hero = pickHeroLesson({
      ...base,
      next_lesson: {
        learning_objective_id: 12,
        title_bn: 'নতুন',
        chapter_title_bn: 'অধ্যায়',
        chapter_number: 2,
        subject_title_bn: 'বিজ্ঞান',
        estimated_minutes: 20,
      },
    });
    expect(hero).toMatchObject({ isResume: false, href: '/tutor?objective_id=12', cta: 'পাঠ শুরু করো' });
    expect(pickHeroLesson(base)).toBeNull();
    expect(pickHeroLesson(undefined)).toBeNull();
  });
});
