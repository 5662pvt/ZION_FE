export type ReturnReason = "Defective" | "WrongItem" | "NotAsDescribed" | "ChangedMind" | "Other";

export type ReturnRequestStatus = "Requested" | "Approved" | "Rejected" | "ShippedBack" | "Received" | "Refunded";

export type RefundMethod = "Online" | "COD" | null;

export type RefundStatus = "Pending" | "Succeeded" | "Failed";

export interface ReturnRequestDto {
  id: string;
  orderId: string;
  orderCode: string;
  reason: ReturnReason;
  note: string | null;
  status: ReturnRequestStatus;
  rejectReason: string | null;
  returnTrackingCode: string | null;
  refundAmount: number;
  refundMethod: RefundMethod;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  shippedBackAt: string | null;
  receivedAt: string | null;
  refundedAt: string | null;
}

export interface AdminReturnRequestDto extends ReturnRequestDto {
  recipientName: string;
  phoneNumber: string;
}

export interface RefundDto {
  id: string;
  orderId: string;
  returnRequestId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  method: string;
  status: RefundStatus;
  providerRefundId: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface RequestReturnBody {
  reason: ReturnReason;
  note?: string;
}

export interface MarkShippedBackBody {
  trackingCode?: string;
}

export interface RejectReturnBody {
  reason: string;
}

export interface AdminReturnListParams {
  page?: number;
  pageSize?: number;
  status?: ReturnRequestStatus;
}

export interface AdminRefundListParams {
  page?: number;
  pageSize?: number;
  status?: RefundStatus;
}
