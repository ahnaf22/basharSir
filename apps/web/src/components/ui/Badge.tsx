import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'navy'
  | 'teal'
  | 'amber'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariantMap: Record<BadgeVariant, string> = {
  navy: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  teal: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
  amber: 'bg-accent-warm/10 text-accent-warm border-accent-warm/20',
  success: 'bg-status-success/10 text-status-success border-status-success/20',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
  neutral: 'bg-subtle text-content-secondary border-border-subtle',
};

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-heading text-xs font-medium leading-tight',
        badgeVariantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

