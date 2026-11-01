import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TimedExaminationWorkspace } from '@/features/examinations/components/TimedExaminationWorkspace';

export default function StudentExamsPage(): React.ReactElement {
  return (
    <AppShell title="সময়াবদ্ধ পরীক্ষা ও রুব্রিক ফলাফল (Examinations & Rubric Results)">
      <TimedExaminationWorkspace />
    </AppShell>
  );
}

