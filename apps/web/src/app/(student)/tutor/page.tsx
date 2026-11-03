import React, { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { AiPrivateTutorWorkspace } from '@/features/tutor/components/AiPrivateTutorWorkspace';

export default function StudentAiTutorPage(): React.ReactElement {
  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        wide
        title="ব্যক্তিগত এআই গৃহশিক্ষক (NCTB AI Tutor)"
        subtitle="৩-পেন অ্যাকাডেমিক লার্নিং ওয়ার্কস্পেস · ধাপে ধাপে পাঠদান ও সার্বক্ষণিক সহায়তা"
      >
        <Suspense fallback={<CardSkeleton />}>
          <AiPrivateTutorWorkspace />
        </Suspense>
      </AppShell>
    </RoleGuard>
  );
}
