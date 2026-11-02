'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from './Button';
import { Badge } from './Badge';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';

export interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  titleBn?: string;
  descriptionBn?: string;
}

export function FeatureGate({
  featureKey,
  children,
  fallback,
  titleBn,
  descriptionBn,
}: FeatureGateProps): React.ReactElement {
  const { entitlements, canAccess, user } = useAuthStore();

  const isEntitled = canAccess(featureKey);
  const featureInfo = entitlements?.features?.[featureKey];
  const currentPlan = entitlements?.plan;

  if (isEntitled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const upgradeTarget =
    featureInfo?.upgrade_to ??
    (currentPlan?.tier === 'free'
      ? 'Basic / Premium'
      : currentPlan?.tier === 'basic'
      ? 'Premium / Family'
      : 'Family');

  const defaultTitle = titleBn ?? featureInfo?.description_bn ?? 'এই ফিচারটি আপনার বর্তমান প্যাকেজে অন্তর্ভুক্ত নয়';
  const defaultDesc =
    descriptionBn ??
    `বর্তমানে আপনি "${currentPlan?.name_bn ?? 'ফ্রি টায়ার'}" প্যাকেজে আছেন। সম্পূর্ণ সুবিধাটি সক্রিয় করতে "${upgradeTarget}" প্যাকেজে আপগ্রেড করুন।`;

  const upgradeLink =
    user?.account_type === 'guardian'
      ? '/parent/billing'
      : '/parent/billing';

  return (
    <div className="relative overflow-hidden rounded-xl border border-accent-warm/30 bg-gradient-to-br from-amber-50/60 via-surface to-amber-50/30 p-6 text-center shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-warm/10 text-accent-warm">
        <Lock className="h-6 w-6" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <Badge variant="amber">প্যাকেজ সীমাবদ্ধতা</Badge>
        {currentPlan && (
          <Badge variant="neutral">বর্তমান: {currentPlan.name_bn}</Badge>
        )}
      </div>

      <h3 className="mt-2 font-heading text-base font-bold text-content-primary">
        {defaultTitle}
      </h3>

      <p className="mx-auto mt-1.5 max-w-md font-bangla text-xs text-content-secondary leading-relaxed">
        {defaultDesc}
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Link href={upgradeLink}>
          <Button size="sm" variant="primary" className="bg-accent-warm hover:bg-accent-warm/90 text-white">
            <Sparkles className="h-3.5 w-3.5" />
            প্যাকেজ আপগ্রেড দেখুন
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

