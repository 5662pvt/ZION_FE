"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Alert, Button, Flex, Result, Space, Spin, Table, Tag, Typography, type TableProps } from "antd";
import AdminOrderTimeline from "./AdminOrderTimeline";
import AdminOrderActions from "./AdminOrderActions";
import { useAdminOrder } from "@/hooks/useAdminOrders";
import { ApiError } from "@/services/apiClient";
import { orderStatusColor, orderStatusLabel, paymentMethodLabel } from "@/utils/orderStatus";
import { formatVnd } from "@/utils/money";
import { formatAddress } from "@/utils/address";
import type { OrderLineDto } from "@/types/orders";

const { Title, Text } = Typography;

interface AdminOrderDetailProps {
  orderId: string;
}

export default function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const { data: order, isLoading, isError, error } = useAdminOrder(orderId);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        extra={
          <Link href="/admin/orders">
            <Button type="primary">Về danh sách đơn hàng</Button>
          </Link>
        }
      />
    );
  }

  if (isError || !order) {
    return <Alert type="error" message="Không tải được thông tin đơn hàng" showIcon />;
  }

  const lineColumns: TableProps<OrderLineDto>["columns"] = [
    { title: "Sản phẩm", dataIndex: "productName" },
    { title: "Đơn giá", dataIndex: "unitPrice", render: (value: number) => formatVnd(value) },
    { title: "Số lượng", dataIndex: "quantity" },
    { title: "Thành tiền", dataIndex: "lineTotal", render: (value: number) => formatVnd(value) },
  ];

  return (
    <div>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Đơn hàng {order.code}
          </Title>
          <Text type="secondary">Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
        </div>
        <Space direction="vertical" align="end">
          <Tag color={orderStatusColor(order.status)}>{orderStatusLabel(order.status)}</Tag>
          <Text type="secondary">{paymentMethodLabel(order.paymentMethod)}</Text>
        </Space>
      </Flex>

      <Table<OrderLineDto>
        rowKey="productId"
        dataSource={order.lines}
        columns={lineColumns}
        pagination={false}
        scroll={{ x: 480 }}
        style={{ marginBottom: 24 }}
      />

      <Flex gap={24} wrap="wrap" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Title level={5}>Địa chỉ giao hàng</Title>
          <div>
            {order.shippingAddress.recipientName} · {order.shippingAddress.phoneNumber}
          </div>
          <div>{formatAddress(order.shippingAddress)}</div>
          {order.note && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Ghi chú: {order.note}</Text>
            </div>
          )}
          {order.cancelReason && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Lý do huỷ: {order.cancelReason}</Text>
            </div>
          )}
        </div>
        <div style={{ minWidth: 220 }}>
          <Flex justify="space-between">
            <Text>Tạm tính</Text>
            <Text>{formatVnd(order.subtotal)}</Text>
          </Flex>
          {order.discountAmount > 0 && (
            <Flex justify="space-between">
              <Text>Mã giảm giá {order.couponCode}</Text>
              <Text type="success">−{formatVnd(order.discountAmount)}</Text>
            </Flex>
          )}
          <Flex justify="space-between">
            <Text>Phí vận chuyển</Text>
            <Text>{order.shippingFee === 0 ? "Miễn phí" : formatVnd(order.shippingFee)}</Text>
          </Flex>
          <Flex justify="space-between" style={{ marginTop: 8 }}>
            <Text strong>Tổng cộng</Text>
            <Text strong>{formatVnd(order.total)}</Text>
          </Flex>
        </div>
      </Flex>

      <AdminOrderActions order={order} />

      <Title level={5} style={{ marginTop: 24 }}>
        Lịch sử trạng thái
      </Title>
      <AdminOrderTimeline history={order.history} />
    </div>
  );
}
