import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let mockPathname = '/planner';
const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn() }),
  usePathname: () => mockPathname,
}));

import { StudyDeskShell } from '../StudyDeskShell';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AuthUserDto } from '@/features/auth/types/auth.types';
import * as dashboardApi from '@/features/dashboard/api/student-dashboard.api';

const student: AuthUserDto = {
  uuid: 'u-1',
  name_en: 'Rafi Ahmed',
  name_bn: 'রাফি আহমেদ',
  phone: '+8801712000001',
  email: null,
  account_type: 'student',
  status: 'active',
  phone_verified: true,
  student_profile: {
    student_code: 'STU-1',
    current_class_level: 8,
    medium: 'bangla',
    school_name: 'স্কুল',
    district: 'ঢাকা',
    date_of_birth: '2012-04-15',
    consent_status: 'verified',
    daily_study_target_mins: 45,
    pseudonym: 'x',
    guardian_phone_masked: '+88017******00',
  },
};

function renderShell(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('StudyDeskShell', () => {
  beforeEach(() => {
    replace.mockClear();
    mockPathname = '/planner';
    useAuthStore.getState().clearSession();
    vi.spyOn(dashboardApi, 'fetchMyEntitlementsApi').mockResolvedValue({
      success: true,
      message: 'ok',
      meta: { correlation_id: 'r', curriculum_version: 'v1' },
      data: {
        plan: { id: 1, code: 'f', name_bn: 'ফ্যামিলি প্যাক (Family)', name_en: 'Family', tier: 'family', max_children_supported: 4 },
        features: {},
      },
    });
  });

  it('gives a student every study-desk menu, highlights the open page and wraps content with a heading', async () => {
    useAuthStore.getState().setSession(student, 'token');
    renderShell(
      <StudyDeskShell title="পড়ার রুটিন" subtitle="উপশিরোনাম">
        <p>পৃষ্ঠার ভেতরের অংশ</p>
      </StudyDeskShell>,
    );

    const sidebar = screen.getByRole('navigation', { name: 'প্রধান মেনু' });
    const links = within(sidebar).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/home', '/tutor', '/planner', '/materials', '/exams', '/scripts', '/analytics', '/group-learning', '/teachers',
    ]);
    expect(within(sidebar).getByRole('link', { name: /পড়ার রুটিন/ })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', { name: /AI Tutor/ })).not.toHaveAttribute('aria-current');

    expect(screen.getByRole('heading', { level: 1, name: 'পড়ার রুটিন' })).toBeInTheDocument();
    expect(screen.getByText('পৃষ্ঠার ভেতরের অংশ')).toBeInTheDocument();
    expect(await screen.findByText('ফ্যামিলি প্যাক')).toBeInTheDocument();
  });

  it('opens the profile menu (billing + logout) and the mobile "আরও" sheet with the full menu', () => {
    useAuthStore.getState().setSession(student, 'token');
    renderShell(<StudyDeskShell>content</StudyDeskShell>);

    fireEvent.click(screen.getByRole('button', { name: /প্রোফাইল/ }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /প্যাকেজ ও সাবস্ক্রিপশন/ })).toHaveAttribute('href', '/parent/billing');
    expect(within(menu).getByRole('menuitem', { name: /লগআউট/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'আরও' }));
    const sheet = screen.getByRole('dialog', { name: 'সব মেনু' });
    expect(within(sheet).getByRole('link', { name: /শিক্ষক বুকিং/ })).toHaveAttribute('href', '/teachers');
    expect(within(sheet).getByRole('link', { name: /অগ্রগতি/ })).toHaveAttribute('href', '/analytics');
  });

  it('shows a guardian the parent-portal menu instead of the student one', () => {
    mockPathname = '/parent/children';
    useAuthStore.getState().setSession(
      { ...student, uuid: 'g-1', name_bn: 'আহমেদ সাহেব', account_type: 'guardian', student_profile: null } as unknown as AuthUserDto,
      'token',
    );
    renderShell(<StudyDeskShell title="সন্তান">x</StudyDeskShell>);

    const sidebar = screen.getByRole('navigation', { name: 'প্রধান মেনু' });
    expect(within(sidebar).getAllByRole('link').map((l) => l.getAttribute('href'))).toEqual([
      '/parent/dashboard', '/parent/children', '/parent/billing', '/teachers',
    ]);
    expect(within(sidebar).getByRole('link', { name: /সন্তান ও সম্মতি/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByPlaceholderText('অধ্যায়, টপিক বা প্রশ্ন খোঁজো')).not.toBeInTheDocument();
  });
});
