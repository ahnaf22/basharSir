import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { QuotaMeter } from '@/components/ui/QuotaMeter';
import { HandwritingGroupAndGamificationWorkspace } from '@/features/phase-five/components/HandwritingGroupAndGamificationWorkspace';

export default function HandwrittenScriptsAndGroupStudyPage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['student', 'admin', 'reviewer']}>
      <AppShell
        title="হাতের লেখার উত্তরপত্র স্ক্যান ও রুব্রিক মূল্যায়ন"
        subtitle="ক্যামেরা/ফাইল আপলোড · বাংলা ও গাণিতিক OCR এবং বহুস্তরীয় রুব্রিক নম্বর প্রদান"
        headerRight={
          <div className="w-48 hidden sm:block">
            <QuotaMeter featureKey="handwriting_ocr.monthly" compact />
          </div>
        }
      >
        <FeatureGate
          featureKey="handwriting_ocr.monthly"
          titleBn="হাতের লেখা খাতা মূল্যায়ন ফিচারটি আনলক করুন"
          descriptionBn="স্মার্টফোনে পরীক্ষার খাতার ছবি তুলে তাৎক্ষণিক এআই রুব্রিক মূল্যায়ন পেতে প্যাকেজ আপগ্রেড করুন।"
        >
          <HandwritingGroupAndGamificationWorkspace />
        </FeatureGate>
      </AppShell>
    </RoleGuard>
  );
}
