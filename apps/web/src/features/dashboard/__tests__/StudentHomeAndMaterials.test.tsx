import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/home',
}));
import StudentHomePage from '@/app/(student)/home/page';
import StudentMaterialsPage from '@/app/(student)/materials/page';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AuthUserDto } from '@/features/auth/types/auth.types';
import * as dashboardApi from '@/features/dashboard/api/student-dashboard.api';
import * as curriculumApi from '@/features/curriculum/api/curriculum.api';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('Chunk 7.5: Student Home Dashboard & Learn Materials', () => {
  const mockStudentUser: AuthUserDto = {
    uuid: 'u-101',
    name_en: 'Rafi Ahmed',
    name_bn: 'রাফি আহমেদ',
    phone: '+8801712000001',
    email: null,
    account_type: 'student',
    status: 'active',
    phone_verified: true,
    student_profile: {
      student_code: 'STU-2026-8001',
      current_class_level: 8,
      medium: 'bangla',
      school_name: 'আইডিয়াল স্কুল',
      district: 'ঢাকা',
      date_of_birth: '2012-04-15',
      consent_status: 'verified',
      daily_study_target_mins: 45,
      pseudonym: 'ধ্রুবতারা-১০১',
      guardian_phone_masked: '+88017******00',
    },
  };

  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setSession(mockStudentUser, 'token-123');
  });

  it('renders the study desk from real dashboard data (resume lesson, routine, mastery, quota, badges)', async () => {
    const today = new Date();
    const iso = (offset: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    vi.spyOn(dashboardApi, 'fetchMyEntitlementsApi').mockResolvedValue({
      success: true,
      message: 'ok',
      meta: { correlation_id: 'req_e', curriculum_version: 'v1' },
      data: {
        plan: { id: 1, code: 'family', name_bn: 'ফ্যামিলি প্যাক', name_en: 'Family', tier: 'family', max_children_supported: 4 },
        features: {
          'ai_tutor.daily_turns': {
            is_enabled: true,
            can_access: true,
            quota: { used: 12, limit: 40, remaining: 28 },
          },
        },
      },
    });
    vi.spyOn(dashboardApi, 'fetchStudentDashboardApi').mockResolvedValueOnce({
      success: true,
      message: 'Dashboard loaded',
      meta: { correlation_id: 'req_1', curriculum_version: 'v1' },
      data: {
        student: {
          student_code: 'STU-2026-8001',
          name_bn: 'রাফি আহমেদ',
          name_en: 'Rafi Ahmed',
          current_class_level: 8,
          medium: 'bangla',
          daily_study_target_mins: 45,
        },
        continue_lesson: {
          session_id: 7,
          session_uuid: 'uuid-1',
          current_stage: 'WORKED_EXAMPLE',
          learning_objective_id: 1,
          title_bn: 'বীজগণিতীয় প্রতীক, চলক ও সহগ শনাক্তকরণ',
          chapter_title_bn: 'বীজগণিতীয় রাশি',
          chapter_number: 3,
          subject_title_bn: 'গণিত',
          active_duration_seconds: 120,
          estimated_remaining_minutes: 15,
        },
        next_lesson: null,
        today_tasks: [
          {
            id: 1,
            title_bn: 'বর্গের সূত্রাবলি অনুশীলন',
            task_type: 'guided_practice',
            subject_title_bn: 'গণিত',
            chapter_title_bn: 'বীজগণিতীয় রাশি',
            chapter_number: 3,
            estimated_minutes: 25,
            status: 'in_progress',
            learning_objective_id: 1,
          },
          {
            id: 2,
            title_bn: 'সদৃশ ও বিসদৃশ পদ',
            task_type: 'revision',
            subject_title_bn: 'গণিত',
            chapter_title_bn: 'বীজগণিতীয় রাশি',
            chapter_number: 3,
            estimated_minutes: 20,
            status: 'completed',
            learning_objective_id: 2,
          },
        ],
        streak: {
          current_days: 3,
          longest_days: 3,
          freezes_available: 1,
          last_active_date: iso(-1),
          week: [-2, -1, 0, 1, 2, 3, 4].map((o, i) => ({
            date: iso(o),
            weekday: (6 + i) % 7,
            studied: o < 0,
            is_today: o === 0,
          })),
          next_milestone: { target_days: 7, remaining_days: 4 },
        },
        gamification: {
          total_xp: 100,
          badges_count: 1,
          badges: [
            {
              id: 1,
              badge_code: 'BADGE_STREAK_3D',
              title_bn: 'ধারাবাহিক সাধক (৩ দিনের স্ট্রিক)',
              awarded_at: '2026-11-01',
            },
          ],
          level: { number: 1, xp_into_level: 100, xp_per_level: 250, next_level_total_xp: 250 },
        },
        today_study_time: { active_seconds: 1800, active_minutes: 30, target_minutes: 45 },
        subject_mastery: [
          {
            id: 5,
            title_bn: 'গণিত',
            title_en: 'Mathematics',
            subject_code: '109',
            mastery_pct: 65,
            total_chapters: 4,
            total_objectives: 3,
            mastered_objectives: 1,
            attempted_objectives: 2,
            objectives: [
              { id: 1, state: 'mastered' },
              { id: 2, state: 'in_progress' },
              { id: 3, state: 'not_started' },
            ],
            next_chapter: { id: 33, chapter_number: 3, title_bn: 'বীজগণিতীয় রাশি' },
          },
        ],
        upcoming_exams: [
          {
            id: 9,
            title_bn: 'বীজগণিত মডেল টেস্ট',
            subject_title_bn: 'গণিত',
            exam_type: 'model_test',
            duration_minutes: 40,
            total_marks: '30.00',
            question_count: 22,
            mcq_count: 20,
            creative_count: 2,
          },
        ],
      },
    });

    renderWithClient(<StudentHomePage />);

    // routine + hero come from the API payload
    expect(await screen.findByText('বর্গের সূত্রাবলি অনুশীলন')).toBeInTheDocument();
    expect(screen.getByText('বীজগণিতীয় প্রতীক, চলক ও সহগ শনাক্তকরণ')).toBeInTheDocument();
    expect(screen.getByText(/অধ্যায় ৩: বীজগণিতীয় রাশি/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /পাঠ চালিয়ে যাও/ })).toHaveAttribute('href', '/tutor?session_id=7');
    expect(screen.getByText('আর আনুমানিক ১৫ মিনিট')).toBeInTheDocument();

    // ledger: done-count derives from task status, goal from the study-time log
    expect(screen.getByText('/২ শেষ')).toBeInTheDocument();
    expect(screen.getByText('/৪৫ মি')).toBeInTheDocument();

    // mastery blocks reflect per-objective state
    expect(screen.getByText('৩টি শিখনফলের ১টি পোক্ত')).toBeInTheDocument();
    expect(screen.getByLabelText('পোক্ত')).toBeInTheDocument();

    // badges, level and next streak milestone are API-driven
    expect(screen.getByText('ধারাবাহিক সাধক')).toBeInTheDocument();
    expect(screen.getByText('আর ৪ দিন')).toBeInTheDocument();
    expect(screen.getByText('লেভেল ১')).toBeInTheDocument();

    // exam composition + sidebar quota come from the API, not constants
    expect(screen.getByText('বীজগণিত মডেল টেস্ট')).toBeInTheDocument();
    expect(screen.getByText('২০টি MCQ')).toBeInTheDocument();
    expect(await screen.findByText('১২/৪০')).toBeInTheDocument();
    expect(screen.getByText('ফ্যামিলি প্যাক')).toBeInTheDocument();
  });

  it('shows honest empty states (no invented lesson or tasks) when nothing is planned', async () => {
    vi.spyOn(dashboardApi, 'fetchMyEntitlementsApi').mockRejectedValue(new Error('offline'));
    vi.spyOn(dashboardApi, 'fetchStudentDashboardApi').mockResolvedValueOnce({
      success: true,
      message: 'Dashboard loaded',
      meta: { correlation_id: 'req_1', curriculum_version: 'v1' },
      data: {
        student: {
          student_code: 'STU-2026-8002',
          name_bn: 'নুসরাত জাহান',
          name_en: 'Nusrat Jahan',
          current_class_level: 7,
          medium: 'bangla',
          daily_study_target_mins: 30,
        },
        continue_lesson: null,
        next_lesson: null,
        today_tasks: [],
        streak: {
          current_days: 0,
          longest_days: 0,
          freezes_available: 0,
          last_active_date: null,
          week: [],
          next_milestone: { target_days: 3, remaining_days: 3 },
        },
        gamification: {
          total_xp: 0,
          badges_count: 0,
          badges: [],
          level: { number: 1, xp_into_level: 0, xp_per_level: 250, next_level_total_xp: 250 },
        },
        today_study_time: { active_seconds: 0, active_minutes: 0, target_minutes: 30 },
        subject_mastery: [],
        upcoming_exams: [],
      },
    });

    renderWithClient(<StudentHomePage />);

    expect(await screen.findByText('রুটিন বানিয়ে প্রথম লেসনটা বেছে নাও')).toBeInTheDocument();
    expect(screen.getByText(/আজকের জন্য কোনো কাজ ঠিক করা নেই/)).toBeInTheDocument();
    expect(screen.getByText('এখনো কোনো টেস্ট নেই')).toBeInTheDocument();
    expect(screen.queryByText(/বর্গের সূত্রাবলি/)).not.toBeInTheDocument();
    expect(screen.queryByText(/সহগ আর চলকের/)).not.toBeInTheDocument();
  });


  it('renders StudentMaterialsPage with enrolled subjects and chapter objectives', async () => {
    vi.spyOn(curriculumApi, 'fetchMySubjectsApi').mockResolvedValueOnce({
      success: true,
      message: 'Subjects loaded',
      meta: { correlation_id: 'req_2', curriculum_version: 'v1' },
      data: {
        grade_level: 8,
        class_title_bn: 'অষ্টম শ্রেণি',
        curriculum_version: 'NCTB-2026-BM-v1.0',
        subjects: [
          {
            id: 10,
            title_bn: 'গণিত',
            title_en: 'Mathematics',
            subject_code: '109',
            chapters: [
              {
                id: 101,
                chapter_number: 4,
                title_bn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
                title_en: 'Algebraic Formulae',
                topics_count: 2,
                objectives_count: 3,
                topics: [
                  {
                    id: 201,
                    title_bn: 'বর্গের সম্প্রসারণ',
                    learning_objectives: [
                      {
                        id: 301,
                        code: 'M-8-4-1',
                        title_bn: 'দ্বিপদী রাশির বর্গ নির্ণয় করতে পারবে',
                        bloom_taxonomy_level: 'apply',
                        mastery: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    vi.spyOn(curriculumApi, 'fetchChapterResourcesApi').mockResolvedValueOnce({
      success: true,
      message: 'Resources loaded',
      meta: { correlation_id: 'req_3', curriculum_version: 'v1' },
      data: {
        chapter_id: 101,
        chapter_title_bn: 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
        resources: [],
      },
    });

    renderWithClient(<StudentMaterialsPage />);

    const elements = await screen.findAllByText('বীজগণিতীয় সূত্রাবলি ও প্রয়োগ');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText('দ্বিপদী রাশির বর্গ নির্ণয় করতে পারবে')).toBeInTheDocument();
    expect(screen.getByText('পাঠ শুরু')).toBeInTheDocument();
  });
});
