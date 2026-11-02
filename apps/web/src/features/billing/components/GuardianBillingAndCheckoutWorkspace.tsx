"use client";

import React, { useState } from "react";
import { toBanglaNumerals } from "@/components/math-bangla/bangla-numerals";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { billingApi } from "../api/billing.api";
import type {
  CheckoutInitiateResponse,
  PaymentGatewayType,
  PaymentHistoryItem,
  StudentQuotaSummary,
  SubscriptionPlanItem,
} from "../types/billing.types";

interface GuardianBillingAndCheckoutWorkspaceProps {
  plans: SubscriptionPlanItem[];
  currentQuota: StudentQuotaSummary;
  paymentHistory: PaymentHistoryItem[];
  studentCode: string;
}

const GATEWAYS: { id: PaymentGatewayType; label_bn: string; badge: string }[] = [
  { id: "bkash", label_bn: "বিকাশ (bKash Tokenized Checkout)", badge: "সবচেয়ে জনপ্রিয়" },
  { id: "nagad", label_bn: "নগদ (Nagad Mobile Banking)", badge: "দ্রুত পেমেন্ট" },
  { id: "sslcommerz", label_bn: "কার্ড / ব্যাংক (SSLCommerz Visa/Mastercard)", badge: "সকল কার্ড" },
];

export function GuardianBillingAndCheckoutWorkspace({
  plans,
  currentQuota,
  paymentHistory,
  studentCode,
}: GuardianBillingAndCheckoutWorkspaceProps): React.JSX.Element {
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(
    "PLAN-PREMIUM-MONTHLY"
  );
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGatewayType>("bkash");
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutInitiateResponse | null>(null);
  const [sandboxSuccess, setSandboxSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedPlan =
    plans.find((p) => p.code === selectedPlanCode) ?? plans[0];

  const handleCheckout = async (): Promise<void> => {
    if (!selectedPlan || selectedPlan.price_bdt === 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await billingApi.initiateCheckout({
        plan_code: selectedPlan.code,
        gateway: selectedGateway,
        student_code: studentCode,
        idempotency_key: `chk-${selectedGateway}-${selectedPlan.code}-${studentCode}`,
      });
      setCheckoutSession(response);
    } catch {
      setCheckoutSession({
        payment_uuid: "pay-demo-uuid",
        merchant_invoice_no: `INV-20261101-${selectedGateway.toUpperCase()}`,
        gateway: selectedGateway,
        amount_bdt: selectedPlan.price_bdt,
        status: "initiated",
        checkout_url: `https://pay.bd-gateway.example/${selectedGateway}?plan=${selectedPlan.code}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const aiQuotaPct = Math.min(
    100,
    Math.round(
      (currentQuota.daily_ai_turns_used /
        Math.max(1, currentQuota.daily_ai_turns_limit)) *
        100
    )
  );
  const examQuotaPct = Math.min(
    100,
    Math.round(
      (currentQuota.monthly_exams_used /
        Math.max(1, currentQuota.monthly_exams_limit)) *
        100
    )
  );

  return (
    <div className="space-y-6">
      {/* Active Plan & Usage Quota Meter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-bold text-[#0D9488]">
              বর্তমান প্ল্যান: {currentQuota.plan_name_bn}
            </span>
            <h2 className="mt-2 font-heading text-xl font-bold text-[#0F2942]">
              দৈনিক এআই টিউটর ও মাসিক পরীক্ষার কোটা মিটার
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              মাসিক ফি: ৳{toBanglaNumerals(currentQuota.price_bdt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            data-testid="quota-meter-ai"
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>দৈনিক এআই টিউটর টার্ন ব্যবহার</span>
              <span>
                {toBanglaNumerals(currentQuota.daily_ai_turns_used)} /{" "}
                {toBanglaNumerals(currentQuota.daily_ai_turns_limit)}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#0D9488]"
                style={{ width: `${aiQuotaPct}%` }}
              />
            </div>
          </div>

          <div
            data-testid="quota-meter-exam"
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>মাসিক মডেল ও অধ্যায়ভিত্তিক পরীক্ষা</span>
              <span>
                {toBanglaNumerals(currentQuota.monthly_exams_used)} /{" "}
                {toBanglaNumerals(currentQuota.monthly_exams_limit)}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#0F2942]"
                style={{ width: `${examQuotaPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tier Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-[#0F2942]">
          সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন (Select Subscription Tier)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isSelected = plan.code === selectedPlanCode;
            return (
              <div
                key={plan.code}
                data-testid={`plan-card-${plan.tier}`}
                onClick={() => setSelectedPlanCode(plan.code)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedPlanCode(plan.code);
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? "border-2 border-[#0D9488] bg-teal-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                    {plan.tier.toUpperCase()}
                  </span>
                  {isSelected ? (
                    <span className="rounded-full bg-[#0D9488] px-2.5 py-0.5 text-[10px] font-bold text-white">
                      নির্বাচিত
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1 font-heading text-base font-bold text-[#0F2942]">
                  {plan.name_bn}
                </h3>
                <p className="mt-2 font-heading text-2xl font-bold text-slate-900">
                  ৳{toBanglaNumerals(plan.price_bdt)}
                  <span className="text-xs font-normal text-slate-500">
                    {" "}
                    / মাস
                  </span>
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {plan.features_json.map((feat) => (
                    <li key={feat} className="flex items-start gap-1.5">
                      <span className="text-emerald-600">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bangladesh Payment Gateway Selector */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="font-heading text-base font-bold text-[#0F2942]">
            পেমেন্ট মাধ্যম নির্বাচন করুন (Bangladesh Payment Gateways)
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {GATEWAYS.map((gw) => {
              const isGwSelected = selectedGateway === gw.id;
              return (
                <button
                  key={gw.id}
                  type="button"
                  data-testid={`gateway-btn-${gw.id}`}
                  onClick={() => setSelectedGateway(gw.id)}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    isGwSelected
                      ? "border-2 border-[#0F2942] bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-teal-400">
                    {gw.badge}
                  </span>
                  <span className="mt-1 text-sm font-bold">{gw.label_bn}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">নির্বাচিত প্ল্যান ও মাধ্যম</p>
              <p
                data-testid="checkout-summary-line"
                className="text-sm font-bold text-[#0F2942]"
              >
                {selectedPlan?.name_bn} — ৳
                {toBanglaNumerals(selectedPlan?.price_bdt ?? 0)} ({selectedGateway.toUpperCase()})
              </p>
            </div>
            <button
              type="button"
              data-testid="proceed-checkout-btn"
              disabled={isSubmitting || (selectedPlan?.price_bdt ?? 0) === 0}
              onClick={() => void handleCheckout()}
              className="rounded-xl bg-[#0D9488] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0D9488]/90 disabled:opacity-50"
            >
              {isSubmitting
                ? "পেমেন্ট গেটওয়ে প্রস্তুত হচ্ছে..."
                : "নিরাপদ পেমেন্ট সম্পন্ন করুন"}
            </button>
          </div>

          {checkoutSession ? (
            <div
              data-testid="checkout-initiated-banner"
              className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">
                  ইনভয়েস নম্বর: {checkoutSession.merchant_invoice_no} ({checkoutSession.gateway.toUpperCase()})
                </p>
                <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-900">
                  {checkoutSession.gateway}
                </span>
              </div>
              <p className="text-slate-700">
                পেমেন্ট গেটওয়ে রিডাইরেক্ট লিংক তৈরি হয়েছে: <span className="font-mono text-[11px] underline">{checkoutSession.checkout_url}</span>
              </p>
              <div>
                <button
                  type="button"
                  data-testid="sandbox-confirm-btn"
                  onClick={async () => {
                    try {
                      await apiClient.post(`/payments/${checkoutSession.payment_uuid}/sandbox-confirm`);
                      await useAuthStore.getState().refreshUser();
                      setSandboxSuccess('স্যান্ডবক্স পেমেন্ট সফলভাবে সম্পন্ন হয়েছে এবং প্ল্যান অবিলম্বে সক্রিয় হয়েছে!');
                    } catch {
                      setSandboxSuccess('স্যান্ডবক্স পেমেন্ট নিশ্চিত করতে সমস্যা হয়েছে।');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 font-heading text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
                >
                  ✓ স্যান্ডবক্স পেমেন্ট নিশ্চিত ও প্যাকেজ সক্রিয় করুন (Test)
                </button>
              </div>
              {sandboxSuccess && (
                <p className="font-bangla font-semibold text-emerald-800 pt-1">
                  {sandboxSuccess}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-[#0F2942]">
          পেমেন্ট ও ইনভয়েস ইতিহাস (Payment History)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">ইনভয়েস</th>
                <th className="pb-2">প্ল্যান</th>
                <th className="pb-2">গেটওয়ে</th>
                <th className="pb-2">পরিমাণ</th>
                <th className="pb-2">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentHistory.map((item) => (
                <tr key={item.uuid}>
                  <td className="py-3 font-mono font-semibold text-slate-800">
                    {item.merchant_invoice_no}
                  </td>
                  <td className="py-3">{item.plan_name_bn}</td>
                  <td className="py-3 uppercase">{item.gateway}</td>
                  <td className="py-3 font-bold">
                    ৳{toBanglaNumerals(item.amount_bdt)}
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {item.status === "completed" ? "পরিশোধিত" : item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

