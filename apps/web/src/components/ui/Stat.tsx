import React from 'react';
import { cn } from '@/lib/utils';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accent?: 'navy' | 'teal' | 'amber' | 'neutral';
}

const accentMap = {
  navy: 'border-l-4 border-l-brand-primary text-brand-primary bg-brand-primary/5',
  teal: 'border-l-4 border-l-brand-secondary text-brand-secondary bg-brand-secondary/5',
  amber: 'border-l-4 border-l-accent-warm text-accent-warm bg-accent-warm/5',
  neutral: 'border-l-4 border-l-slate-300 text-content-primary bg-subtle/50',
};

export function Stat({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = 'teal',
  className,
  ...props
}: StatProps): React.ReactElement {
  const displayValue =
    typeof value === 'number' ? toBanglaNumerals(value) : value;

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-4 transition-all duration-200 hover:shadow-sm',
        accentMap[accent],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading text-xs font-medium text-content-secondary">
          {title}
        </span>
        {icon && <div className="text-content-secondary/80">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-2xl font-bold tracking-tight text-content-primary">
          {displayValue}
        </span>
        {trend && (
          <span
            className={cn(
              'font-heading text-xs font-semibold',
              trend.isPositive ? 'text-status-success' : 'text-status-danger'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 font-bangla text-xs text-content-secondary leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}

