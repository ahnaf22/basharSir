import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { GroupLearningWorkspace } from '@/features/group-learning/components/GroupLearningWorkspace';

export default function GroupLearningPage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['student']}>
      <AppShell
        title="ছোট দলের গ্রুপ স্টাডি ও সহপাঠী শিখন"
        subtitle="একই শ্রেণির ৩–৫ জন সহপাঠীর প্রাইভেট স্টাডি রুম · ব্যাচ মোড কুইজ, সাইড-অ্যাসিস্ট্যান্স ও সুরক্ষিত প্রশ্ন সারি"
      >
        <FeatureGate
          featureKey="group_learning.join"
          titleBn="গ্রুপ স্টাডি ফিচারটি আনলক করুন"
          descriptionBn="সহপাঠীদের সাথে প্রাইভেট ব্যাচ স্টাডি রুমে অংশ নিতে ও একসাথে অনুশীলন করতে প্যাকেজ আপগ্রেড করুন।"
        >
          <GroupLearningWorkspace />
        </FeatureGate>
      </AppShell>
    </RoleGuard>
  );
}
