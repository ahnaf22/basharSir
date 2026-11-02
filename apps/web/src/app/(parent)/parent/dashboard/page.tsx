import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { GuardianParentPortalDashboard } from "@/features/parent-portal/components/GuardianParentPortalDashboard";

export default function GuardianParentDashboardPage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['guardian']}>
      <AppShell title="অভিভাবক ড্যাশবোর্ড ও সাপ্তাহিক অগ্রগতি প্রতিবেদন">
        <GuardianParentPortalDashboard />
      </AppShell>
    </RoleGuard>
  );
}
