'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FileCheck2,
  LineChart,
  Users,
  PenTool,
  GraduationCap,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuotaMeter } from '@/components/ui/QuotaMeter';
import { ChildSwitcher } from './ChildSwitcher';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { logoutApi } from '@/features/auth/api/auth.api';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  title?: string;
  subtitle?: string;
  curriculumBadge?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  featureKey?: string;
}

const studentNavItems: NavItem[] = [
  { name: 'ড্যাশবোর্ড', href: '/home', icon: LayoutDashboard },
  { name: 'এআই গৃহশিক্ষক', href: '/tutor', icon: Sparkles, badge: 'NCTB' },
  { name: 'পাঠ্যবই ও নোট', href: '/materials', icon: BookOpen },
  { name: 'পড়ার রুটিন', href: '/planner', icon: CalendarDays },
  { name: 'মডেল টেস্ট', href: '/exams', icon: FileCheck2 },
  { name: 'অগ্রগতি বিশ্লেষণ', href: '/analytics', icon: LineChart },
  { name: 'গ্রুপ স্টাডি', href: '/group-learning', icon: Users, badge: '৩-৫ জন' },
  { name: 'খাতা মূল্যায়ন', href: '/scripts', icon: PenTool },
  { name: 'শিক্ষক বুকিং', href: '/teachers', icon: GraduationCap },
];

const guardianNavItems: NavItem[] = [
  { name: 'অভিভাবক ড্যাশবোর্ড', href: '/parent/dashboard', icon: LayoutDashboard },
  { name: 'সন্তান ও সম্মতি (PDPA)', href: '/parent/children', icon: Users },
  { name: 'প্যাকেজ ও বিলিং', href: '/parent/billing', icon: CreditCard, badge: 'bKash' },
  { name: 'শিক্ষক বুকিং', href: '/teachers', icon: GraduationCap },
];

export function AppShell({
  title,
  subtitle,
  curriculumBadge = 'NCTB-2026-BM-v1.0',
  headerRight,
  children,
  className,
}: AppShellProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const {
    user,
    linkedChildren,
    activeStudentCode,
    setActiveStudentCode,
    entitlements,
    clearSession,
  } = useAuthStore();

  const isGuardian = user?.account_type === 'guardian';
  const navItems = isGuardian ? guardianNavItems : studentNavItems;
  const currentPlan = entitlements?.plan;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Proceed with local logout regardless
    }
    clearSession();
    router.replace('/login');
  };

  const planTierBadge = (tier?: string) => {
    switch (tier) {
      case 'family':
        return <Badge variant="teal">ফ্যামিলি প্যাক</Badge>;
      case 'premium':
        return <Badge variant="navy">প্রিমিয়াম</Badge>;
      case 'basic':
        return <Badge variant="amber">বেসিক</Badge>;
      default:
        return <Badge variant="neutral">ফ্রি ট্রায়াল</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-content-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-content-secondary hover:bg-subtle lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href={isGuardian ? '/parent/dashboard' : '/home'} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFB238] text-[#241600] font-heading font-black text-xl -rotate-6 shadow-sm">
                প
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold text-[#EDE8DA]">
                    পড়া হবে<em className="text-[#FFB238] not-italic">!</em>{' '}
                    <span className="text-[11px] font-semibold text-[#FFB238]">PORA HOBE</span>
                  </span>
                  <span className="hidden font-mono text-[10px] text-[#7FD6A0] sm:inline-block">
                    LIVE
                  </span>
                </div>
                <p className="hidden font-bangla text-[11px] text-[#7E8A80] sm:block">
                  জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) ২০২৬
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Guardian Child Switcher (if guardian) */}
          {isGuardian && linkedChildren.length > 0 && (
            <div className="hidden md:block">
              <ChildSwitcher
                childrenList={linkedChildren}
                activeStudentCode={activeStudentCode}
                onSelectChild={(code) => setActiveStudentCode(code)}
              />
            </div>
          )}

          {/* Right Section: Badges & User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="navy" className="hidden lg:inline-flex">
                {curriculumBadge}
              </Badge>
              {planTierBadge(currentPlan?.tier)}
            </div>

            {headerRight}

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-medium text-content-primary hover:bg-subtle transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="font-heading font-semibold leading-tight">
                      {user.name_bn || user.name_en}
                    </div>
                    <div className="font-mono text-[10px] text-content-secondary">
                      {user.account_type === 'guardian' ? 'অভিভাবক' : 'শিক্ষার্থী'}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-content-secondary" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border-subtle bg-surface p-2 shadow-lg">
                      <div className="border-b border-border-subtle/60 px-3 py-2">
                        <p className="font-heading text-xs font-semibold text-content-primary">
                          {user.name_bn || user.name_en}
                        </p>
                        <p className="font-mono text-[11px] text-content-secondary">
                          {user.phone}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3 text-brand-secondary" />
                          <span className="font-bangla text-[10px] text-content-secondary">
                            PDPA ২০২৬ যাচাইকৃত
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href={isGuardian ? '/parent/billing' : '/parent/billing'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-content-primary hover:bg-subtle transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-content-secondary" />
                          প্যাকেজ ও সাবস্ক্রিপশন
                        </Link>
                      </div>

                      <div className="border-t border-border-subtle/60 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-status-danger hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          লগআউট করুন
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    লগইন
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary">
                    রেজিস্ট্রেশন
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="mx-auto flex max-w-7xl">
        {/* Desktop Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-border-subtle bg-surface p-4 lg:flex">
          <div className="space-y-6">
            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="px-3 py-1 font-heading text-[11px] font-semibold tracking-wider text-content-secondary uppercase">
                {isGuardian ? 'অভিভাবক পোর্টাল' : 'একাডেমিক মেনু'}
              </div>

              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 font-heading text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#FFB238] text-[#241600] font-bold shadow-sm'
                        : 'text-content-secondary hover:bg-subtle hover:text-content-primary'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn('h-4 w-4', isActive ? 'text-[#241600]' : 'text-content-secondary')} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                          isActive
                            ? 'bg-[#241600]/15 text-[#241600]'
                            : 'bg-brand-secondary/15 text-brand-secondary'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Bottom: Quota Meter & Plan Box */}
          <div className="space-y-3 pt-4 border-t border-border-subtle/80">
            <QuotaMeter
              featureKey="ai_tutor.daily_turns"
              label="আজকের টিউটর টার্ন কোটা"
            />

            <div className="rounded-xl bg-subtle/60 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-content-primary">
                  {currentPlan?.name_bn ?? 'ফ্রি প্ল্যান'}
                </span>
                <Link
                  href="/parent/billing"
                  className="font-bangla text-[11px] font-semibold text-brand-secondary hover:underline"
                >
                  আপগ্রেড
                </Link>
              </div>
              <p className="mt-1 font-bangla text-[11px] text-content-secondary leading-tight">
                {currentPlan?.tier === 'family'
                  ? 'সব সন্তান সর্বোচ্চ সুবিধা পাচ্ছে'
                  : 'আনলিমিটেড পাঠ ও লাইভ পরীক্ষার জন্য আপগ্রেড করুন'}
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-surface p-5 shadow-2xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB238] text-[#241600] font-heading font-black text-lg -rotate-6">
                      প
                    </div>
                    <span className="font-heading font-bold text-[#EDE8DA]">
                      পড়া হবে<em className="text-[#FFB238] not-italic">!</em>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1 text-content-secondary hover:bg-subtle"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {isGuardian && linkedChildren.length > 0 && (
                  <div className="pb-3 border-b border-border-subtle">
                    <ChildSwitcher
                      childrenList={linkedChildren}
                      activeStudentCode={activeStudentCode}
                      onSelectChild={(code) => {
                        setActiveStudentCode(code);
                        setMobileMenuOpen(false);
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-3 py-2.5 font-heading text-xs font-medium',
                          isActive
                            ? 'bg-brand-primary text-white font-semibold'
                            : 'text-content-secondary hover:bg-subtle hover:text-content-primary'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-content-secondary')} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                              isActive ? 'bg-white/20 text-white' : 'bg-brand-secondary/10 text-brand-secondary'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <QuotaMeter featureKey="ai_tutor.daily_turns" compact />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-status-danger hover:bg-red-50"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  লগআউট
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="font-heading text-xl font-bold tracking-tight text-content-primary sm:text-2xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 font-bangla text-xs text-content-secondary sm:text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className={className}>{children}</div>
        </main>
      </div>
    </div>
  );
}
