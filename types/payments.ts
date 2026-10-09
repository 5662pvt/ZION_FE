export type PaymentIntentStatus = "Pending" | "Succeeded" | "Failed" | "Cancelled";

export interface PaymentIntentDto {
  paymentId: string;
  intentId: string;
  orderId: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  redirectUrl: string | null;
  expiresAt: string;
}

export interface SimulatePaymentRequest {
  result: "success" | "failure";
}
