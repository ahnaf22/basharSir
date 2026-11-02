import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { TeacherMarketplaceAndExpansionWorkspace } from '@/features/teacher-marketplace/components/TeacherMarketplaceAndExpansionWorkspace';

export default function TeacherMarketplacePage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['student', 'guardian']}>
      <AppShell
        title="যাচাইকৃত মানব শিক্ষক মার্কেটপ্লেস ও লাইভ ক্লাস"
        subtitle="এনসিটিবি গণিত ও বিজ্ঞান অভিজ্ঞ শিক্ষক · ১-অন-১ ক্লাস বুকিং ও এআই স্টুডেন্ট ডায়াগনস্টিক হ্যান্ডঅফ"
      >
        <FeatureGate
          featureKey="teacher_marketplace.booking"
          titleBn="অভিজ্ঞ শিক্ষক ক্লাস বুকিং আনলক করুন"
          descriptionBn="লাইভ ১-অন-১ শিক্ষকের ক্লাস বুকিং এবং এআই স্টুডেন্ট ডায়াগনস্টিক ব্রিফ হ্যান্ড-অফের সুবিধা পেতে প্যাকেজ আপগ্রেড করুন।"
        >
          <TeacherMarketplaceAndExpansionWorkspace />
        </FeatureGate>
      </AppShell>
    </RoleGuard>
  );
}
