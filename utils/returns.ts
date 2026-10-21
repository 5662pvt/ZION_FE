import type { RefundMethod, RefundStatus, ReturnReason, ReturnRequestStatus } from "@/types/returns";

const REASON_LABELS: Record<ReturnReason, string> = {
  Defective: "Hàng lỗi/hỏng",
  WrongItem: "Giao sai hàng",
  NotAsDescribed: "Không đúng mô tả",
  ChangedMind: "Đổi ý",
  Other: "Lý do khác",
};

const STATUS_LABELS: Record<ReturnRequestStatus, string> = {
  Requested: "Chờ duyệt",
  Approved: "Đã duyệt – chờ gửi hàng",
  Rejected: "Bị từ chối",
  ShippedBack: "Khách đã gửi hàng",
  Received: "Shop đã nhận hàng – đang hoàn tiền",
  Refunded: "Đã hoàn tiền",
};

const STATUS_COLORS: Record<ReturnRequestStatus, string> = {
  Requested: "var(--color-warning)",
  Approved: "var(--color-primary)",
  Rejected: "var(--color-danger)",
  ShippedBack: "var(--color-primary)",
  Received: "#0F9D8A",
  Refunded: "var(--color-success)",
};

const REFUND_METHOD_LABELS: Record<NonNullable<RefundMethod>, string> = {
  Online: "Hoàn online",
  COD: "Hoàn tiền mặt (COD)",
};

const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  Pending: "Đang xử lý",
  Succeeded: "Thành công",
  Failed: "Thất bại",
};

const REFUND_STATUS_COLORS: Record<RefundStatus, string> = {
  Pending: "var(--color-warning)",
  Succeeded: "var(--color-success)",
  Failed: "var(--color-danger)",
};

export function returnReasonLabel(reason: ReturnReason): string {
  return REASON_LABELS[reason];
}

export function returnStatusLabel(status: ReturnRequestStatus): string {
  return STATUS_LABELS[status];
}

export function returnStatusColor(status: ReturnRequestStatus): string {
  return STATUS_COLORS[status];
}

export function refundMethodLabel(method: RefundMethod): string {
  return method ? REFUND_METHOD_LABELS[method] : "—";
}

export function refundStatusLabel(status: RefundStatus): string {
  return REFUND_STATUS_LABELS[status];
}

export function refundStatusColor(status: RefundStatus): string {
  return REFUND_STATUS_COLORS[status];
}
