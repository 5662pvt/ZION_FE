import { Alert, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { orderStatusLabel } from "@/utils/orderStatus";
import type { OrderDto } from "@/types/orders";

const { Text } = Typography;

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

  const items = order.history.map((entry, index) => ({
    color: index === order.history.length - 1 ? "blue" : "green",
    children: (
      <div>
        <Text strong>{orderStatusLabel(entry.status)}</Text>
        <div>
          <Text type="secondary">{dayjs(entry.at).format("DD/MM/YYYY HH:mm")}</Text>
        </div>
        {entry.note && <Text type="secondary">{entry.note}</Text>}
      </div>
    ),
  }));

  return <Timeline items={items} style={{ marginBottom: 16 }} />;
}
