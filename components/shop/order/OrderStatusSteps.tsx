import { Alert, Steps } from "antd";
import type { OrderDto, OrderStatus } from "@/types/orders";

const COD_STEPS: Array<{ status: OrderStatus; title: string }> = [
  { status: "PendingStock", title: "Đang giữ hàng" },
  { status: "Confirmed", title: "Đã xác nhận" },
  { status: "Shipped", title: "Đang giao" },
  { status: "Completed", title: "Hoàn tất" },
];

const ONLINE_STEPS: Array<{ status: OrderStatus; title: string }> = [
  { status: "PendingStock", title: "Đang giữ hàng" },
  { status: "AwaitingPayment", title: "Chờ thanh toán" },
  { status: "Paid", title: "Đã thanh toán" },
  { status: "Shipped", title: "Đang giao" },
  { status: "Completed", title: "Hoàn tất" },
];

interface OrderStatusStepsProps {
  order: OrderDto;
}

export default function OrderStatusSteps({ order }: OrderStatusStepsProps) {
  if (order.status === "Cancelled") {
    return (
      <Alert
        type="error"
        message="Đơn hàng đã huỷ"
        description={order.cancelReason ?? undefined}
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  const steps = order.paymentMethod === "Online" ? ONLINE_STEPS : COD_STEPS;
  const current = Math.max(0, steps.findIndex((s) => s.status === order.status));

  return <Steps current={current} items={steps.map((s) => ({ title: s.title }))} style={{ marginBottom: 16 }} />;
}
