export type SubscriptionTier = "free" | "basic" | "premium" | "family";
export type PaymentGatewayType = "bkash" | "nagad" | "sslcommerz";

export interface SubscriptionPlanItem {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  tier: SubscriptionTier;
  price_bdt: number;
  billing_cycle: "monthly" | "yearly";
  daily_ai_turns_limit: number;
  monthly_exams_limit: number;
  max_children_supported: number;
  features_json: string[];
  is_active: boolean;
}

export interface StudentQuotaSummary {
  plan_code: string;
  plan_name_bn: string;
  tier: SubscriptionTier;
  price_bdt: number;
  daily_ai_turns_used: number;
  daily_ai_turns_limit: number;
  monthly_exams_used: number;
  monthly_exams_limit: number;
  can_use_ai_tutor: boolean;
  can_start_exam: boolean;
}

export interface PaymentHistoryItem {
  id: number;
  uuid: string;
  merchant_invoice_no: string;
  gateway_trx_id: string | null;
  gateway: PaymentGatewayType;
  amount_bdt: number;
  status: "initiated" | "completed" | "failed" | "refunded";
  paid_at: string | null;
  plan_name_bn: string;
}

export interface CheckoutInitiateResponse {
  payment_uuid: string;
  merchant_invoice_no: string;
  gateway: PaymentGatewayType;
  amount_bdt: number;
  status: string;
  checkout_url: string;
}

