import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherMarketplaceAndExpansionWorkspace } from "@/features/teacher-marketplace/components/TeacherMarketplaceAndExpansionWorkspace";

export default function TeacherMarketplacePage(): React.JSX.Element {
  return (
    <AppShell title="মানব শিক্ষক মার্কেটপ্লেস ও ১ম-১০ম শ্রেণি পাঠ্যক্রম">
      <TeacherMarketplaceAndExpansionWorkspace />
    </AppShell>
  );
}

