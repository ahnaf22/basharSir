import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { GuardianBillingAndCheckoutWorkspace } from "@/features/billing/components/GuardianBillingAndCheckoutWorkspace";
import type {
  PaymentHistoryItem,
  StudentQuotaSummary,
  SubscriptionPlanItem,
} from "@/features/billing/types/billing.types";

const initialPlans: SubscriptionPlanItem[] = [
  {
    id: 1,
    code: "PLAN-FREE-MONTHLY",
    name_bn: "ফ্রি ট্রায়াল (Free Tier)",
    name_en: "Free Tier",
    tier: "free",
    price_bdt: 0,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 15,
    monthly_exams_limit: 2,
    max_children_supported: 1,
    features_json: [
      "দৈনিক ১৫টি এআই টিউটর টার্ন",
      "মাসে ২টি অধ্যায়ভিত্তিক কুইজ",
    ],
    is_active: true,
  },
  {
    id: 2,
    code: "PLAN-BASIC-MONTHLY",
    name_bn: "বেসিক টিউটর প্ল্যান (Basic)",
    name_en: "Basic Tutor Plan",
    tier: "basic",
    price_bdt: 499,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 40,
    monthly_exams_limit: 15,
    max_children_supported: 1,
    features_json: [
      "দৈনিক ৪০টি এআই টিউটর টার্ন",
      "মাসে ১৫টি অধ্যায় ও বিষয়ভিত্তিক পরীক্ষা",
    ],
    is_active: true,
  },
  {
    id: 3,
    code: "PLAN-PREMIUM-MONTHLY",
    name_bn: "প্রিমিয়াম হোম টিউটর (Premium)",
    name_en: "Premium Home Tutor",
    tier: "premium",
    price_bdt: 999,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 200,
    monthly_exams_limit: 60,
    max_children_supported: 1,
    features_json: [
      "দৈনিক ২০০টি এআই টিউটর টার্ন",
      "মাসে ৬০টি সৃজনশীল ও মডেল বোর্ড পরীক্ষা",
    ],
    is_active: true,
  },
  {
    id: 4,
    code: "PLAN-FAMILY-MONTHLY",
    name_bn: "ফ্যামিলি প্যাক (Family)",
    name_en: "Family Pack",
    tier: "family",
    price_bdt: 1499,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 300,
    monthly_exams_limit: 100,
    max_children_supported: 3,
    features_json: [
      "সর্বোচ্চ ৩ জন সন্তানের জন্য প্রিমিয়াম সুবিধা",
      "দৈনিক ৩০০টি এআই টিউটর টার্ন ও ১০০টি মাসিক পরীক্ষা",
    ],
    is_active: true,
  },
];

const initialQuota: StudentQuotaSummary = {
  plan_code: "PLAN-BASIC-MONTHLY",
  plan_name_bn: "বেসিক টিউটর প্ল্যান (Basic)",
  tier: "basic",
  price_bdt: 499,
  daily_ai_turns_used: 18,
  daily_ai_turns_limit: 40,
  monthly_exams_used: 4,
  monthly_exams_limit: 15,
  can_use_ai_tutor: true,
  can_start_exam: true,
};

const initialHistory: PaymentHistoryItem[] = [
  {
    id: 1,
    uuid: "pay-hist-001",
    merchant_invoice_no: "INV-20261001-BKASH01",
    gateway_trx_id: "BKASH-TRX-889911",
    gateway: "bkash",
    amount_bdt: 499,
    status: "completed",
    paid_at: "2026-10-01T10:30:00Z",
    plan_name_bn: "বেসিক টিউটর প্ল্যান (Basic)",
  },
];

export default function GuardianBillingPage(): React.JSX.Element {
  return (
    <RoleGuard allowedRoles={['guardian', 'student']}>
      <AppShell
        title="প্যাকেজ ও সাবস্ক্রিপশন ব্যবস্থাপনা"
        subtitle="বিকাশ, নগদ ও কার্ডের মাধ্যমে তাৎক্ষণিক পেমেন্ট ও প্যাকেজ সক্রিয়করণ"
      >
        <GuardianBillingAndCheckoutWorkspace
          plans={initialPlans}
          currentQuota={initialQuota}
          paymentHistory={initialHistory}
          studentCode="STU-2026-0001"
        />
      </AppShell>
    </RoleGuard>
  );
}

