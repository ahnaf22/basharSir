import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StudyPlannerAndCalendarWorkspace } from '@/features/study-planner/components/StudyPlannerAndCalendarWorkspace';

export default function StudentStudyPlannerPage(): React.ReactElement {
  return (
    <AppShell title="অধ্যয়ন পরিকল্পনা ও ক্যালেন্ডার (Study Planner & Calendar)">
      <StudyPlannerAndCalendarWorkspace />
    </AppShell>
  );
}

