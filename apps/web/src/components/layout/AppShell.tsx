'use client';

import React from 'react';
import { StudyDeskShell } from '@/components/layout/StudyDeskShell';

export interface AppShellProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Use the full content width (e.g. the 3-pane tutor workspace). */
  wide?: boolean;
}

/**
 * Page frame for every signed-in route. It renders the shared study-desk chrome
 * (see `StudyDeskShell`) so the sidebar, top bar and mobile tab bar look and behave
 * the same on the dashboard, tutor, planner, exams, materials, parent portal, etc.
 */
export function AppShell({
  title,
  subtitle,
  headerRight,
  children,
  className,
  wide,
}: AppShellProps): React.ReactElement {
  return (
    <StudyDeskShell title={title} subtitle={subtitle} headerRight={headerRight} className={className} wide={wide}>
      {children}
    </StudyDeskShell>
  );
}
