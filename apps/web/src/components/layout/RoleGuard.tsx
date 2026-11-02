'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { AccountType } from '@/features/auth/types/auth.types';
import { Loader2 } from 'lucide-react';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: AccountType[];
  requireConsent?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireConsent = false,
}: RoleGuardProps): React.ReactElement | null {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken || !user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.account_type)) {
      if (user.account_type === 'guardian') {
        router.replace('/parent/dashboard');
      } else {
        router.replace('/home');
      }
      return;
    }

    if (requireConsent && user.account_type === 'student') {
      if (user.student_profile?.consent_status !== 'verified') {
        router.replace('/parent/children');
      }
    }
  }, [user, accessToken, isHydrated, allowedRoles, requireConsent, router]);

  if (!isHydrated || !accessToken || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
        <p className="font-bangla text-xs text-content-secondary">
          সেশন যাচাই করা হচ্ছে...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

