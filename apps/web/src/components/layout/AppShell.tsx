import React from 'react';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  title: string;
  subtitle?: string;
  curriculumBadge?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({
  title,
  subtitle,
  curriculumBadge = 'NCTB-2026-BM-v1.0',
  headerRight,
  children,
  className,
}: AppShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-canvas text-content-primary">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-base font-bold text-brand-primary sm:text-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-content-secondary">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="navy">{curriculumBadge}</Badge>
            {headerRight}
          </div>
        </div>
      </header>

      <main className={cn('mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}>
        {children}
      </main>
    </div>
  );
}

