import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HandwritingGroupAndGamificationWorkspace } from "@/features/phase-five/components/HandwritingGroupAndGamificationWorkspace";

export default function HandwrittenScriptsAndGroupStudyPage(): React.JSX.Element {
  return (
    <AppShell title="হাতের লেখার উত্তরপত্র, গ্রুপ স্টাডি ও লিডারবোর্ড">
      <HandwritingGroupAndGamificationWorkspace />
    </AppShell>
  );
}

