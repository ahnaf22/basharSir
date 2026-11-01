import { apiClient } from "@/services/api-client";
import type {
  CheckoutInitiateResponse,
  PaymentGatewayType,
  SubscriptionPlanItem,
} from "../types/billing.types";

export interface InitiateCheckoutInput {
  plan_code: string;
  gateway: PaymentGatewayType;
  student_code?: string;
  idempotency_key: string;
}

export const billingApi = {
  listPlans: async (): Promise<SubscriptionPlanItem[]> => {
    const response = await apiClient.get<{ plans: SubscriptionPlanItem[] }>(
      "/subscriptions/plans"
    );
    return response.data.plans;
  },

  initiateCheckout: async (
    input: InitiateCheckoutInput
  ): Promise<CheckoutInitiateResponse> => {
    const response = await apiClient.post<CheckoutInitiateResponse>(
      "/payments/checkout",
      input
    );
    return response.data;
  },
};

