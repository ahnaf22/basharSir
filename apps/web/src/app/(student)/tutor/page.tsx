import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AiPrivateTutorWorkspace } from '@/features/tutor/components/AiPrivateTutorWorkspace';

export default function StudentAiTutorPage(): React.ReactElement {
  return (
    <AppShell title="ব্যক্তিগত এআই গৃহশিক্ষক (AI Private Tutor)">
      <AiPrivateTutorWorkspace />
    </AppShell>
  );
}
