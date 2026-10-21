import type { OrderStatus, PaymentMethod } from "@/types/orders";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PendingStock: "Đang giữ hàng",
  AwaitingPayment: "Chờ thanh toán",
  Confirmed: "Đã xác nhận",
  Paid: "Đã thanh toán",
  Shipped: "Đang giao",
  Completed: "Hoàn tất",
  Cancelled: "Đã huỷ",
  Returned: "Đã trả hàng",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PendingStock: "default",
  AwaitingPayment: "gold",
  Confirmed: "blue",
  Paid: "cyan",
  Shipped: "geekblue",
  Completed: "green",
  Cancelled: "red",
  Returned: "default",
};

const STATUS_HEX: Record<OrderStatus, string> = {
  PendingStock: "#B7791F",
  AwaitingPayment: "#B7791F",
  Confirmed: "#0F9D8A",
  Paid: "#0F9D8A",
  Shipped: "#142B4A",
  Completed: "#16845B",
  Cancelled: "#C2413B",
  Returned: "#66758A",
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

export function orderStatusHex(status: OrderStatus): string {
  return STATUS_HEX[status];
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return CUSTOMER_CANCELLABLE_STATUSES.has(status);
}

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}
