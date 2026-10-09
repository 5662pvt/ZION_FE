import { apiGet, apiPost } from "./apiClient";
import type { PaymentIntentDto, SimulatePaymentRequest } from "@/types/payments";

export const paymentsService = {
  createIntent: (orderId: string, idempotencyKey: string) =>
    apiPost<PaymentIntentDto>(
      "/api/v1/payments/intents",
      { orderId },
      { headers: { "Idempotency-Key": idempotencyKey } }
    ).then((r) => r.data),

  getIntent: (intentId: string) => apiGet<PaymentIntentDto>(`/api/v1/payments/intents/${intentId}`).then((r) => r.data),

  simulate: (intentId: string, result: SimulatePaymentRequest["result"]) =>
    apiPost<PaymentIntentDto>(`/api/v1/payments/fake/${intentId}/simulate`, { result }).then((r) => r.data),
};
