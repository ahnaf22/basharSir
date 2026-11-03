import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { QuotaMeter } from '@/components/ui/QuotaMeter';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AuthUserDto, EntitlementsSnapshotDto } from '@/features/auth/types/auth.types';

describe('Chunk 7.3: Web Foundation & Design System Rebuild', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('renders Button with variants and loading state', () => {
    const { rerender } = render(<Button variant="primary">পাঠ শুরু করুন</Button>);
    expect(screen.getByRole('button', { name: 'পাঠ শুরু করুন' })).toBeInTheDocument();

    rerender(<Button isLoading>পাঠ শুরু করুন</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Card with header and content', () => {
    render(
      <Card elevated>
        <CardHeader>
          <CardTitle>বীজগণিতীয় সূত্রাবলি</CardTitle>
        </CardHeader>
        <CardContent>
          <p>অধ্যায় নোট ও অনুশীলন</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('বীজগণিতীয় সূত্রাবলি')).toBeInTheDocument();
    expect(screen.getByText('অধ্যায় নোট ও অনুশীলন')).toBeInTheDocument();
  });

  it('renders EmptyState with action button', () => {
    const onActionMock = vi.fn();
    render(
      <EmptyState
        title="কোনো পরীক্ষা পাওয়া যায়নি"
        description="আপনার ক্লাসের জন্য কোনো আসন্ন পরীক্ষা নেই।"
        actionLabel="মডেল টেস্ট দিন"
        onAction={onActionMock}
      />
    );

    expect(screen.getByText('কোনো পরীক্ষা পাওয়া যায়নি')).toBeInTheDocument();
    expect(screen.getByText('আপনার ক্লাসের জন্য কোনো আসন্ন পরীক্ষা নেই।')).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: 'মডেল টেস্ট দিন' });
    fireEvent.click(btn);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('renders Input with Bengali label and error feedback', () => {
    render(
      <Input
        label="মোবাইল নম্বর"
        placeholder="০১XXXXXXXXX"
        error="সঠিক মোবাইল নম্বর লিখুন"
      />
    );

    expect(screen.getByLabelText('মোবাইল নম্বর')).toBeInTheDocument();
    expect(screen.getByText('সঠিক মোবাইল নম্বর লিখুন')).toBeInTheDocument();
  });

  it('enforces package-based FeatureGate based on entitlements store', () => {
    const mockUser: AuthUserDto = {
      uuid: 'u-1',
      name_en: 'Rafi Ahmed',
      name_bn: 'রাফি আহমেদ',
      phone: '+8801712000001',
      email: null,
      account_type: 'student',
      status: 'active',
      phone_verified: true,
    };

    const freeEntitlements: EntitlementsSnapshotDto = {
      plan: {
        id: 1,
        code: 'PLAN-FREE',
        name_bn: 'ফ্রি প্ল্যান',
        name_en: 'Free Plan',
        tier: 'free',
        price_bdt: 0,
        billing_cycle: 'monthly',
        max_children_supported: 1,
      },
      features: {
        'group_learning.create': {
          is_enabled: false,
          quota_limit: null,
          description_bn: 'নতুন গ্রুপ স্টাডি রুম তৈরি',
          can_access: false,
          quota: null,
          upgrade_to: 'Basic / Premium',
        },
      },
    };

    useAuthStore.getState().setSession(mockUser, 'test-token', freeEntitlements);

    const { rerender } = render(
      <FeatureGate featureKey="group_learning.create">
        <div>গোপন গ্রুপ স্টাডি কনটেন্ট</div>
      </FeatureGate>
    );

    // Blocked by gate
    expect(screen.queryByText('গোপন গ্রুপ স্টাডি কনটেন্ট')).not.toBeInTheDocument();
    expect(screen.getByText('প্যাকেজ সীমাবদ্ধতা')).toBeInTheDocument();
    expect(screen.getByText('প্যাকেজ আপগ্রেড দেখুন')).toBeInTheDocument();

    // Now upgrade entitlements to premium
    const premiumEntitlements: EntitlementsSnapshotDto = {
      ...freeEntitlements,
      plan: {
        ...freeEntitlements.plan,
        tier: 'premium',
        name_bn: 'প্রিমিয়াম প্ল্যান',
      },
      features: {
        'group_learning.create': {
          is_enabled: true,
          quota_limit: null,
          description_bn: 'নতুন গ্রুপ স্টাডি রুম তৈরি',
          can_access: true,
          quota: null,
          upgrade_to: null,
        },
      },
    };

    act(() => {
      useAuthStore.getState().setEntitlements(premiumEntitlements);
    });

    rerender(
      <FeatureGate featureKey="group_learning.create">
        <div>গোপন গ্রুপ স্টাডি কনটেন্ট</div>
      </FeatureGate>
    );

    expect(screen.getByText('গোপন গ্রুপ স্টাডি কনটেন্ট')).toBeInTheDocument();
  });

  it('renders QuotaMeter with real turn count in Bengali numerals', () => {
    const mockUser: AuthUserDto = {
      uuid: 'u-1',
      name_en: 'Rafi',
      name_bn: 'রাফি',
      phone: '+8801712000001',
      email: null,
      account_type: 'student',
      status: 'active',
      phone_verified: true,
    };

    const entitlements: EntitlementsSnapshotDto = {
      plan: {
        id: 4,
        code: 'PLAN-FAMILY',
        name_bn: 'ফ্যামিলি প্যাক',
        name_en: 'Family Pack',
        tier: 'family',
        price_bdt: 1499,
        billing_cycle: 'monthly',
        max_children_supported: 4,
      },
      features: {
        'ai_tutor.daily_turns': {
          is_enabled: true,
          quota_limit: 300,
          description_bn: 'দৈনিক এআই টিউটর টার্ন সীমা',
          can_access: true,
          quota: {
            used: 4,
            limit: 300,
            remaining: 296,
          },
          upgrade_to: null,
        },
      },
    };

    useAuthStore.getState().setSession(mockUser, 'test-token', entitlements);

    render(<QuotaMeter featureKey="ai_tutor.daily_turns" />);

    expect(screen.getByText('দৈনিক এআই টিউটর টার্ন সীমা')).toBeInTheDocument();
    // 296 converted to '২৯৬'
    expect(screen.getByText(/বাকি: ২৯৬টি/)).toBeInTheDocument();
    expect(screen.getByText(/ব্যবহৃত: ৪ \/ ৩০০/)).toBeInTheDocument();
  });
});
