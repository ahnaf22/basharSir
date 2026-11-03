'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface QuotaMeterProps {
  featureKey: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function QuotaMeter({
  featureKey,
  label,
  compact = false,
  className,
}: QuotaMeterProps): React.ReactElement | null {
  const { entitlements } = useAuthStore();
  const feature = entitlements?.features?.[featureKey];

  if (!feature || !feature.quota) {
    return null;
  }

  const { used, limit, remaining } = feature.quota;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = pct >= 80;
  const isExhausted = remaining <= 0;

  const displayLabel = label ?? feature.description_bn;

  if (compact) {
    return (
      <div className={cn('text-xs font-bangla', className)}>
        <div className="flex items-center justify-between text-content-secondary mb-1">
          <span className="font-heading truncate">{displayLabel}</span>
          <span className="font-mono text-xs font-semibold text-content-primary">
            {toBanglaNumerals(used)}/{toBanglaNumerals(limit)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <div
            className={cn(
              'h-full transition-all duration-300',
              isExhausted
                ? 'bg-status-danger'
                : isNearLimit
                ? 'bg-status-warning'
                : 'bg-brand-secondary'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-3.5',
        isExhausted && 'border-status-danger/40 bg-red-50/30',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-xs font-semibold text-content-primary">
          {displayLabel}
        </span>
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 text-xs font-semibold font-mono',
            isExhausted
              ? 'bg-status-danger/10 text-status-danger'
              : isNearLimit
              ? 'bg-status-warning/10 text-status-warning'
              : 'bg-brand-secondary/10 text-brand-secondary'
          )}
        >
          বাকি: {toBanglaNumerals(remaining)}টি
        </span>
      </div>

      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isExhausted
              ? 'bg-status-danger'
              : isNearLimit
              ? 'bg-status-warning'
              : 'bg-brand-secondary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-content-secondary">
        <span>
          ব্যবহৃত: {toBanglaNumerals(used)} / {toBanglaNumerals(limit)}
        </span>
        {isNearLimit && (
          <Link
            href="/parent/billing"
            className="flex items-center gap-0.5 font-medium text-accent-warm hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            কোটা বাড়ান
          </Link>
        )}
      </div>
    </div>
  );
}

