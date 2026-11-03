'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import '@/styles/student-dashboard.css';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { ChildSwitcher } from '@/components/layout/ChildSwitcher';
import {
  GUARDIAN_NAV,
  GUARDIAN_TABS,
  STUDENT_NAV,
  STUDENT_TABS,
  isNavActive,
  searchCurriculum,
  type DeskIcon,
} from '@/components/layout/desk-nav';
import { fetchMyEntitlementsApi } from '@/features/dashboard/api/student-dashboard.api';
import { avatarInitial, mediumLabelBn, shortPlanName } from '@/features/dashboard/lib/dashboard-view';
import { fetchMySubjectsApi } from '@/features/curriculum/api/curriculum.api';
import { logoutApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useFocusTrap } from '@/lib/useFocusTrap';

export interface StudyDeskShellProps {
  children: React.ReactNode;
  /**
   * `home` renders children straight into the dashboard's `.home-desk` grid.
   * `page` (default) wraps them in a padded content column with an optional heading.
   */
  variant?: 'home' | 'page';
  /** Let the content use the full width (the 3-pane tutor workspace). */
  wide?: boolean;
  title?: string;
  subtitle?: string;
  /** Right-aligned actions beside the page heading. */
  headerRight?: React.ReactNode;
  className?: string;
}

/** Icon sprite shared by the sidebar, tab bar and dashboard content (`<use href="#i-…">`). */
function DeskSprite(): React.ReactElement {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <symbol id="i-home" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></symbol>
      <symbol id="i-tutor" viewBox="0 0 24 24"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /><path d="M8 10.5h8M8 13.5h5" /></symbol>
      <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 6c2.5-1.5 5.5-1.5 8 .5 2.5-2 5.5-2 8-.5v13c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z" /><path d="M12 6.5V19.5" /></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></symbol>
      <symbol id="i-test" viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14 3.5V8h4M9 13l2 2 4-4" /></symbol>
      <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20h16M7 16v-4M12 16V8M17 16v-6" /></symbol>
      <symbol id="i-group" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3" /><circle cx="17" cy="10" r="2.3" /><path d="M3.5 19c.5-3.4 2.8-5.4 5.5-5.4s5 2 5.5 5.4M14.3 19c.3-2.3 1.4-3.8 2.9-3.8s2.8 1.5 3.1 3.8" /></symbol>
      <symbol id="i-khata" viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M8 3.5v17M11 8h5M11 11.5h5M11 15h3" /></symbol>
      <symbol id="i-teacher" viewBox="0 0 24 24"><path d="M2.5 9 12 5l9.5 4L12 13z" /><path d="M6.5 11v4.5c1.6 1.5 3.5 2.2 5.5 2.2s3.9-.7 5.5-2.2V11M21.5 9v5" /></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></symbol>
      <symbol id="i-snow" viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" /></symbol>
      <symbol id="i-family" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" /></symbol>
      <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></symbol>
      <symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h3" /></symbol>
      <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></symbol>
    </svg>
  );
}

function Icon({ name, size }: { name: DeskIcon | 'logout' | 'search' | 'bell'; size?: number }): React.ReactElement {
  return (
    <svg className="ico" style={size ? { width: size, height: size } : undefined} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

/**
 * The study-desk chrome (sidebar "shelf", top bar, mobile tab bar) shared by every signed-in page,
 * so each sidebar menu opens its page inside the same shell as `Student-Dashboard.html`.
 */
export function StudyDeskShell({
  children,
  variant = 'page',
  wide = false,
  title,
  subtitle,
  headerRight,
  className,
}: StudyDeskShellProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { user, linkedChildren, activeStudentCode, setActiveStudentCode, entitlements: storedEntitlements, clearSession } =
    useAuthStore();

  const isGuardian = user?.account_type === 'guardian';
  const isStudent = user?.account_type === 'student';
  const navGroups = isGuardian ? GUARDIAN_NAV : STUDENT_NAV;
  const tabs = isGuardian ? GUARDIAN_TABS : STUDENT_TABS;
  const homeHref = isGuardian ? '/parent/dashboard' : '/home';

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreSheetRef = useRef<HTMLDivElement>(null);
  useFocusTrap(moreSheetRef, moreOpen, () => setMoreOpen(false));

  // Usage limits + plan for the sidebar. Students only: it is their quota.
  const { data: entitlements } = useQuery({
    queryKey: ['my-entitlements'],
    queryFn: async () => (await fetchMyEntitlementsApi()).data,
    staleTime: 60_000,
    enabled: isStudent,
  });

  // The student's own curriculum powers the search box; fetched only once they type.
  const { data: curriculum } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: async () => (await fetchMySubjectsApi()).data,
    staleTime: 60_000,
    enabled: isStudent && searchText.trim().length > 0,
  });
  const searchHits = useMemo(() => searchCurriculum(curriculum, searchText), [curriculum, searchText]);

  // Route change closes any open overlay.
  useEffect(() => {
    setMoreOpen(false);
    setUserMenuOpen(false);
    setSearchText('');
  }, [pathname]);

  // "/" focuses search (students)
  useEffect(() => {
    if (!isStudent) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isStudent]);

  // Click outside / Escape closes the profile menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // the session is cleared locally regardless
    }
    clearSession();
    router.replace('/login');
  };

  const displayName = user?.name_bn || user?.name_en || '';
  const classLevel = user?.student_profile?.current_class_level;
  const profileLine = isGuardian
    ? 'অভিভাবক'
    : classLevel !== undefined
      ? `ক্লাস ${toBanglaNumerals(classLevel)} · ${mediumLabelBn(user?.student_profile?.medium)}`
      : 'শিক্ষার্থী';

  const tutorQuota = entitlements?.features?.['ai_tutor.daily_turns']?.quota ?? null;
  const quotaPct =
    tutorQuota && tutorQuota.limit > 0
      ? Math.min(100, Math.max(tutorQuota.used > 0 ? 1 : 0, (tutorQuota.used / tutorQuota.limit) * 100))
      : 0;
  const plan = entitlements?.plan ?? storedEntitlements?.plan;

  const profileMenuLinks = isGuardian
    ? [
        { href: '/parent/children', label: 'সন্তান ও সম্মতি', icon: 'family' as const },
        { href: '/parent/billing', label: 'প্যাকেজ ও বিলিং', icon: 'card' as const },
      ]
    : [
        { href: '/analytics', label: 'আমার শিখন প্রোফাইল', icon: 'chart' as const },
        { href: '/parent/billing', label: 'প্যাকেজ ও সাবস্ক্রিপশন', icon: 'card' as const },
      ];

  const content =
    variant === 'home' ? (
      <main className="home-desk">{children}</main>
    ) : (
      <main className={wide ? 'page wide' : 'page'}>
        {(title || subtitle || headerRight) && (
          <div className="page-head">
            <div>
              {title && <h1>{title}</h1>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            {headerRight && <div className="page-head-actions">{headerRight}</div>}
          </div>
        )}
        <div className={className}>{children}</div>
      </main>
    );

  return (
    <>
      <DeskSprite />
      <div id="studentDesk" className="student-desk app">
        {/* ===== SIDEBAR (the shelf) ===== */}
        <aside className="side" aria-label="মেনু">
          <Link className="logo" href={homeHref}>
            <span className="logo-mark" aria-hidden="true">প</span>
            <span className="logo-word">পড়া হবে<em>!</em></span>
          </Link>

          <nav className="nav" aria-label="প্রধান মেনু">
            {navGroups.map((group, gi) => (
              <div className="nav-group" key={group.label ?? `g${gi}`}>
                {group.label && <p className="nav-label">{group.label}</p>}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-current={isNavActive(pathname, item.href) ? 'page' : undefined}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    {item.pill && <span className={item.pill.isNew ? 'pill new' : 'pill'}>{item.pill.text}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {tutorQuota && tutorQuota.limit > 0 && (
            <div className="quota">
              <div className="t">
                <span>আজ Tutor-কে প্রশ্ন</span>
                <b className="num">
                  {toBanglaNumerals(tutorQuota.used)}/{toBanglaNumerals(tutorQuota.limit)}
                </b>
              </div>
              <div className="meter">
                <i style={{ width: `${quotaPct}%` }} />
              </div>
              <small>
                {tutorQuota.remaining > 0
                  ? `আজ আরও ${toBanglaNumerals(tutorQuota.remaining)}টা প্রশ্ন করতে পারবে`
                  : 'আজকের প্রশ্নের সীমা শেষ। কাল আবার পাবে।'}
              </small>
            </div>
          )}

          {plan && (
            <Link className="plan" href="/parent/billing" title="প্যাকেজ ও বিলিং">
              <Icon name="family" />
              <span>
                <b>{shortPlanName(plan.name_bn)}</b>
                {plan.max_children_supported > 1
                  ? `${toBanglaNumerals(plan.max_children_supported)} জন পর্যন্ত ভাইবোন`
                  : 'একজন শিক্ষার্থীর জন্য'}
              </span>
            </Link>
          )}
        </aside>

        <div className="main">
          {/* ===== TOP BAR ===== */}
          <header className="top">
            <Link className="logo mlogo" href={homeHref}>
              <span className="logo-mark" aria-hidden="true">প</span>
              <span className="logo-word">পড়া হবে<em>!</em></span>
            </Link>

            {isStudent ? (
              <div style={{ position: 'relative', flex: 1, maxWidth: 520 }} className="search-wrap">
                <label className="search" htmlFor="q" style={{ maxWidth: 'none' }}>
                  <Icon name="search" />
                  <input
                    id="q"
                    ref={searchInputRef}
                    type="search"
                    placeholder="অধ্যায়, টপিক বা প্রশ্ন খোঁজো"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchText('');
                    }}
                    autoComplete="off"
                  />
                  <kbd>/</kbd>
                </label>
                {searchText.trim() && (
                  <ul
                    className="me-menu"
                    style={{ left: 0, right: 'auto', width: '100%', listStyle: 'none', margin: 0 }}
                    aria-label="খোঁজার ফল"
                  >
                    {searchHits.length === 0 ? (
                      <li style={{ padding: '10px 12px', color: 'var(--chalk-3)', fontSize: '.88rem' }}>
                        {curriculum ? 'কিছু পাওয়া যায়নি' : 'খোঁজা হচ্ছে…'}
                      </li>
                    ) : (
                      searchHits.map((h) => (
                        <li key={h.key}>
                          <Link href={`/materials?chapter_id=${h.chapterId}`} onClick={() => setSearchText('')}>
                            <span style={{ display: 'grid', lineHeight: 1.3 }}>
                              {h.label}
                              <small style={{ color: 'var(--chalk-3)' }}>{h.sub}</small>
                            </span>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            ) : (
              isGuardian &&
              linkedChildren.length > 0 && (
                <div className="child-switch">
                  <ChildSwitcher
                    childrenList={linkedChildren}
                    activeStudentCode={activeStudentCode}
                    onSelectChild={(code) => setActiveStudentCode(code)}
                  />
                </div>
              )
            )}

            <div className="top-act">
              {isStudent && (
                <Link className="iconbtn" href="/planner" aria-label="নোটিফিকেশন ও রুটিন">
                  <Icon name="bell" />
                </Link>
              )}

              {user && (
                <div style={{ position: 'relative' }} ref={menuRef}>
                  <button
                    className="me"
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    aria-label={`প্রোফাইল: ${displayName}`}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="av" aria-hidden="true">{avatarInitial(displayName.split(' ')[0] ?? displayName)}</span>
                    <span>
                      {displayName}
                      <small>{profileLine}</small>
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="me-menu" role="menu">
                      {profileMenuLinks.map((l) => (
                        <Link key={l.href} href={l.href} role="menuitem" onClick={() => setUserMenuOpen(false)}>
                          <Icon name={l.icon} size={16} />
                          {l.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        className="logout"
                        onClick={() => {
                          setUserMenuOpen(false);
                          void handleLogout();
                        }}
                      >
                        <Icon name="logout" size={16} />
                        লগআউট করুন
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {content}
        </div>

        {/* ===== MOBILE: "আরও" sheet + tab bar ===== */}
        {moreOpen && (
          <div ref={moreSheetRef} tabIndex={-1} className="more-sheet" role="dialog" aria-modal="true" aria-label="সব মেনু">
            <button type="button" className="more-backdrop" aria-label="বন্ধ করো" onClick={() => setMoreOpen(false)} />
            <div className="more-panel">
              {navGroups.map((group, gi) => (
                <div key={group.label ?? `m${gi}`}>
                  {group.label && <p className="nav-label">{group.label}</p>}
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isNavActive(pathname, item.href) ? 'page' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
              {plan && (
                <Link href="/parent/billing" onClick={() => setMoreOpen(false)}>
                  <Icon name="card" />
                  <span>প্যাকেজ ও বিলিং · {shortPlanName(plan.name_bn)}</span>
                </Link>
              )}
              <button
                type="button"
                className="logout"
                onClick={() => {
                  setMoreOpen(false);
                  void handleLogout();
                }}
              >
                <Icon name="logout" />
                <span>লগআউট করুন</span>
              </button>
            </div>
          </div>
        )}

        <nav className="tabbar" aria-label="মোবাইল মেনু">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={tab.raised ? 'tutor' : undefined}
              aria-current={isNavActive(pathname, tab.href) ? 'page' : undefined}
            >
              <Icon name={tab.icon} />
              {tab.label}
            </Link>
          ))}
          <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>
            <Icon name="more" />
            আরও
          </button>
        </nav>
      </div>
    </>
  );
}
