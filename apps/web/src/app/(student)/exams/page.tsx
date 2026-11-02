import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { TimedExaminationWorkspace } from '@/features/examinations/components/TimedExaminationWorkspace';

export default function StudentExamsPage(): React.ReactElement {
  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title="সময়াবদ্ধ মডেল টেস্ট ও রুব্রিক মূল্যায়ন"
        subtitle="এনসিটিবি স্ট্যান্ডার্ড প্রশ্নব্যাংক · সার্ভার-টাইমার, স্বয়ংক্রিয় সেভ ও পূর্ণাঙ্গ রুব্রিক ফলাফল"
      >
        <TimedExaminationWorkspace />
      </AppShell>
    </RoleGuard>
  );
}
