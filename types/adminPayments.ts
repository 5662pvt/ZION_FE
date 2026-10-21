import type { PaymentChannel } from "@/types/payments";

export type AdminPaymentStatus = "Pending" | "Succeeded" | "Failed" | "Expired" | "Cancelled" | "Refunded";

export interface AdminPaymentDto {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  channel: PaymentChannel;
  status: AdminPaymentStatus;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

export interface AdminPaymentListParams {
  status?: AdminPaymentStatus;
  channel?: PaymentChannel;
  from?: string;
  to?: string;
  orderId?: string;
  page?: number;
  pageSize?: number;
}
