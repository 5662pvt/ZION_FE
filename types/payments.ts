export type PaymentIntentStatus = "Pending" | "Succeeded" | "Failed" | "Cancelled";

export type PaymentChannel = "Card" | "EWallet" | "BankTransfer";

export interface PaymentIntentDto {
  paymentId: string;
  intentId: string;
  orderId: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  channel: PaymentChannel;
  redirectUrl: string | null;
  expiresAt: string;
}

export interface SimulatePaymentRequest {
  result: "success" | "failure";
}
