import type { OrderStatus, PaymentMethod } from "@/types/orders";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PendingStock: "Đang giữ hàng",
  AwaitingPayment: "Chờ thanh toán",
  Confirmed: "Đã xác nhận",
  Paid: "Đã thanh toán",
  Shipped: "Đang giao",
  Completed: "Hoàn tất",
  Cancelled: "Đã huỷ",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PendingStock: "default",
  AwaitingPayment: "gold",
  Confirmed: "blue",
  Paid: "cyan",
  Shipped: "geekblue",
  Completed: "green",
  Cancelled: "red",
};

const CUSTOMER_CANCELLABLE_STATUSES: ReadonlySet<OrderStatus> = new Set(["PendingStock", "AwaitingPayment", "Confirmed"]);

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  Online: "Thanh toán online",
};

export function orderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function orderStatusColor(status: OrderStatus): string {
  return STATUS_COLORS[status];
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return CUSTOMER_CANCELLABLE_STATUSES.has(status);
}

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}
