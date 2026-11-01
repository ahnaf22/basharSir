'use client';

import React from 'react';
import { Users, CheckCircle2, Clock } from 'lucide-react';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import type { LinkedChildDto } from '@/features/auth/types/auth.types';
import { cn } from '@/lib/utils';

export interface ChildSwitcherProps {
  childrenList: LinkedChildDto[];
  activeStudentCode: string | null;
  onSelectChild: (studentCode: string) => void;
}

export function ChildSwitcher({
  childrenList,
  activeStudentCode,
  onSelectChild,
}: ChildSwitcherProps): React.ReactElement {
  if (childrenList.length === 0) {
    return (
      <div
        data-testid="child-switcher-empty"
        className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-subtle px-3 py-1.5 text-xs text-content-secondary"
      >
        <Users className="h-4 w-4 text-brand-primary" />
        <span>কোনো সন্তান যুক্ত নেই</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="সন্তান নির্বাচন করুন (Child Switcher)"
      data-testid="child-switcher"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
        <Users className="h-4 w-4 text-brand-primary" />
        <span>সন্তান নির্বাচন:</span>
      </span>

      {childrenList.map((item) => {
        const isSelected = item.student.student_code === activeStudentCode;
        const isConsented = item.student.consent_status === 'verified';

        return (
          <button
            key={item.student.student_code}
            type="button"
            onClick={() => onSelectChild(item.student.student_code)}
            data-testid={`child-switch-btn-${item.student.student_code}`}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              isSelected
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border-subtle bg-surface text-content-primary hover:bg-subtle'
            )}
          >
            <span>
              {item.student.name_bn ?? item.student.name_en} (শ্রেণি{' '}
              {toBanglaNumerals(item.student.current_class_level)})
            </span>
            {isConsented ? (
              <CheckCircle2
                className={cn(
                  'h-3.5 w-3.5',
                  isSelected ? 'text-white' : 'text-status-success'
                )}
              />
            ) : (
              <Clock
                className={cn(
                  'h-3.5 w-3.5',
                  isSelected ? 'text-white' : 'text-accent-warm'
                )}
              />
            )}
          </button>
        );
      })}

      {activeStudentCode && (
        <Badge variant="navy" className="font-mono">
          Active: {activeStudentCode}
        </Badge>
      )}
    </div>
  );
}

