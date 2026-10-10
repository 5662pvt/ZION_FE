import type { OrderStatus, PaymentMethod } from "@/types/orders";

export interface OrderHistoryEntry {
  status: OrderStatus;
  at: string;
  note: string | null;
}

export interface AdminOrderSummaryDto {
  id: string;
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
  recipientName: string;
  phoneNumber: string;
}

export interface AdminOrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
  keyword?: string;
}
