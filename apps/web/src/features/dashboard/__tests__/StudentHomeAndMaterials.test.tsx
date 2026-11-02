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

  it('renders StudentHomePage with real aggregated metrics and continue lesson card', async () => {
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
          session_id: 1,
          session_uuid: 'uuid-1',
          current_stage: 'CHECK_PREREQUISITES',
          title_bn: 'বীজগণিতীয় প্রতীক, চলক ও সহগ শনাক্তকরণ',
          chapter_title_bn: 'বীজগণিতীয় রাশি',
          subject_title_bn: 'গণিত',
          active_duration_seconds: 120,
        },
        today_tasks: [
          {
            id: 1,
            title_bn: 'বর্গের সূত্রাবলি অনুশীলন',
            subject_title_bn: 'গণিত',
            estimated_minutes: 25,
            status: 'in_progress',
            learning_objective_id: 1,
          },
        ],
        streak: {
          current_days: 3,
          longest_days: 3,
          freezes_available: 1,
          last_active_date: '2026-11-01',
        },
        gamification: {
          total_xp: 100,
          badges_count: 2,
          badges: [
            {
              id: 1,
              badge_code: 'BADGE_STREAK_3D',
              title_bn: 'ধারাবাহিক সাধক (৩ দিনের স্ট্রিক)',
              awarded_at: '2026-11-01',
            },
          ],
        },
        today_study_time: {
          active_seconds: 1800,
          active_minutes: 30,
          target_minutes: 45,
        },
        subject_mastery: [
          {
            id: 5,
            title_bn: 'গণিত',
            title_en: 'Mathematics',
            subject_code: '109',
            mastery_pct: 65,
            total_chapters: 4,
            total_objectives: 4,
            mastered_objectives: 2,
          },
        ],
        upcoming_exams: [],
      },
    });

    renderWithClient(<StudentHomePage />);

    expect(await screen.findByText(/বর্গের সূত্রাবলি অনুশীলন/)).toBeInTheDocument();
    expect(screen.getByText(/বীজগণিতীয় প্রতীক, চলক ও সহগ শনাক্তকরণ/)).toBeInTheDocument();
    expect(screen.getByText(/ধারাবাহিক সাধক/)).toBeInTheDocument();
    expect(screen.getByText(/পাঠ চালিয়ে যাও/)).toBeInTheDocument();
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
