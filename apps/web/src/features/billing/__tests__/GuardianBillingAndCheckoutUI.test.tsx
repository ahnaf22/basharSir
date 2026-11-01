import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuardianBillingAndCheckoutWorkspace } from "../components/GuardianBillingAndCheckoutWorkspace";
import { billingApi } from "../api/billing.api";
import type {
  PaymentHistoryItem,
  StudentQuotaSummary,
  SubscriptionPlanItem,
} from "../types/billing.types";

const mockPlans: SubscriptionPlanItem[] = [
  {
    id: 1,
    code: "PLAN-FREE-MONTHLY",
    name_bn: "ফ্রি ট্রায়াল",
    name_en: "Free Tier",
    tier: "free",
    price_bdt: 0,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 15,
    monthly_exams_limit: 2,
    max_children_supported: 1,
    features_json: ["দৈনিক ১৫টি এআই টিউটর টার্ন"],
    is_active: true,
  },
  {
    id: 2,
    code: "PLAN-PREMIUM-MONTHLY",
    name_bn: "প্রিমিয়াম হোম টিউটর",
    name_en: "Premium Home Tutor",
    tier: "premium",
    price_bdt: 999,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 200,
    monthly_exams_limit: 60,
    max_children_supported: 1,
    features_json: ["দৈনিক ২০০টি এআই টিউটর টার্ন"],
    is_active: true,
  },
  {
    id: 3,
    code: "PLAN-FAMILY-MONTHLY",
    name_bn: "ফ্যামিলি প্যাক",
    name_en: "Family Pack",
    tier: "family",
    price_bdt: 1499,
    billing_cycle: "monthly",
    daily_ai_turns_limit: 300,
    monthly_exams_limit: 100,
    max_children_supported: 3,
    features_json: ["সর্বোচ্চ ৩ জন সন্তান"],
    is_active: true,
  },
];

const mockQuota: StudentQuotaSummary = {
  plan_code: "PLAN-FREE-MONTHLY",
  plan_name_bn: "ফ্রি ট্রায়াল",
  tier: "free",
  price_bdt: 0,
  daily_ai_turns_used: 12,
  daily_ai_turns_limit: 15,
  monthly_exams_used: 1,
  monthly_exams_limit: 2,
  can_use_ai_tutor: true,
  can_start_exam: true,
};

const mockHistory: PaymentHistoryItem[] = [
  {
    id: 1,
    uuid: "pay-001",
    merchant_invoice_no: "INV-20261001-BKASH01",
    gateway_trx_id: "BKASH-1122",
    gateway: "bkash",
    amount_bdt: 499,
    status: "completed",
    paid_at: "2026-10-01T10:00:00Z",
    plan_name_bn: "বেসিক প্ল্যান",
  },
];

describe("GuardianBillingAndCheckoutWorkspace", () => {
  it("renders quota meters, switches subscription tier and BD payment gateway, and initiates checkout", async () => {
    vi.spyOn(billingApi, "initiateCheckout").mockResolvedValueOnce({
      payment_uuid: "pay-uuid-999",
      merchant_invoice_no: "INV-20261101-NAGAD99",
      gateway: "nagad",
      amount_bdt: 1499,
      status: "initiated",
      checkout_url: "https://api.mynagad.com/check-out/initialize/INV-20261101-NAGAD99",
    });

    render(
      <GuardianBillingAndCheckoutWorkspace
        plans={mockPlans}
        currentQuota={mockQuota}
        paymentHistory={mockHistory}
        studentCode="STU-2026-0001"
      />
    );

    expect(screen.getByTestId("quota-meter-ai").textContent).toContain("১২ / ১৫");

    // Select Family plan and Nagad gateway
    fireEvent.click(screen.getByTestId("plan-card-family"));
    fireEvent.click(screen.getByTestId("gateway-btn-nagad"));

    expect(screen.getByTestId("checkout-summary-line").textContent).toContain(
      "ফ্যামিলি প্যাক — ৳১৪৯৯ (NAGAD)"
    );

    fireEvent.click(screen.getByTestId("proceed-checkout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("checkout-initiated-banner").textContent).toContain(
        "INV-20261101-NAGAD99"
      );
    });
  });
});

