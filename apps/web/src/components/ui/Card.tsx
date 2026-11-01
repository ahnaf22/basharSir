import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({
  className,
  elevated = false,
  children,
  ...props
}: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-5 text-content-primary',
        elevated ? 'shadow-sm' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

