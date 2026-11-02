import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { StudyPlannerAndCalendarWorkspace } from '@/features/study-planner/components/StudyPlannerAndCalendarWorkspace';

export default function StudentStudyPlannerPage(): React.ReactElement {
  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title="ব্যক্তিগত পড়ার রুটিন ও ক্যালেন্ডার"
        subtitle="অ্যাডাপ্টিভ স্টাডি প্ল্যানার · পড়া বাদ পড়লে কোনো চাপ ছাড়াই স্বয়ংক্রিয় রুটিন পুনর্বিন্যাস"
      >
        <StudyPlannerAndCalendarWorkspace />
      </AppShell>
    </RoleGuard>
  );
}
