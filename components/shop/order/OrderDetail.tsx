"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { Alert, Button, Flex, Result, Skeleton, Space, Spin, Table, Typography, type TableProps } from "antd";
import Breadcrumbs from "@/components/shop/layout/Breadcrumbs";
import OrderStatusSteps from "./OrderStatusSteps";
import OrderActions from "./OrderActions";
import ReturnSection from "./ReturnSection";
import { useOrder, useOrderPolling } from "@/hooks/useOrders";
import { ApiError } from "@/services/apiClient";
import { paymentMethodLabel } from "@/utils/orderStatus";
import { formatVnd } from "@/utils/money";
import { formatAddress } from "@/utils/address";
import { OrderStatusBadge, StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderLineDto } from "@/types/orders";

const { Title, Text } = Typography;

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get("payment");
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const { timedOut } = useOrderPolling(orderId, order?.status, refetch);
  useOrderPolling(orderId, order?.returnRequest?.status, refetch, {
    statuses: ["Received"],
    intervalMs: 3000,
    maxMs: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
        <Skeleton active paragraph={{ rows: 4 }} style={{ marginBottom: 24 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        extra={
          <Link href="/account/orders">
            <Button type="primary">Về danh sách đơn hàng</Button>
          </Link>
        }
      />
    );
  }

  if (isError || !order) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <Alert
          type="error"
          message="Không tải được thông tin đơn hàng"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  const lineColumns: TableProps<OrderLineDto>["columns"] = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (name: string, record) => (
        <div>
          <Space size={6}>
            <span>{name}</span>
            {record.isGift && <StatusBadge color="var(--color-warning)">Quà tặng</StatusBadge>}
          </Space>
          {record.variantLabel && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Phân loại: {record.variantLabel}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      render: (value: number, record) => (record.isGift ? "Miễn phí" : formatVnd(value)),
    },
    { title: "Số lượng", dataIndex: "quantity" },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      render: (value: number, record) => (record.isGift ? "Miễn phí" : formatVnd(value)),
    },
    ...(order.status === "Completed"
      ? [
          {
            title: "Đánh giá",
            key: "review",
            render: (_: unknown, record: OrderLineDto) =>
              !record.isGift && <Link href={`/products/id/${record.productId}#reviews`}>Đánh giá</Link>,
          },
        ]
      : []),
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <Breadcrumbs items={[{ label: "Đơn hàng của tôi", href: "/account/orders" }, { label: order.code }]} />
      {paymentResult === "success" && (
        <Alert
          type="success"
          message="Thanh toán thành công, đang chờ xác nhận đơn hàng."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {paymentResult === "failure" && (
        <Alert
          type="error"
          message="Thanh toán thất bại, đơn hàng đã bị huỷ."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Đơn hàng {order.code}
          </Title>
          <Text type="secondary">Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
        </div>
        <Space direction="vertical" align="end">
          <OrderStatusBadge status={order.status} />
          <Text type="secondary">{paymentMethodLabel(order.paymentMethod)}</Text>
        </Space>
      </Flex>

      <OrderStatusSteps order={order} />

      {order.status === "PendingStock" && (
        timedOut ? (
          <Alert
            type="warning"
            message="Hệ thống đang xử lý chậm, vui lòng tải lại trang"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
            <Spin size="small" />
            <Text type="secondary">Đang kiểm tra tồn kho…</Text>
          </Flex>
        )
      )}

      <Table<OrderLineDto>
        rowKey={(line) => `${line.variantId}-${line.isGift}`}
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
        </div>
        <div style={{ minWidth: 220 }}>
          <Flex justify="space-between">
            <Text>Tạm tính</Text>
            <Text>{formatVnd(order.subtotal)}</Text>
          </Flex>
          {order.discountAmount > 0 && (
            <Flex justify="space-between">
              <Text>
                {order.discountTarget === "Shipping"
                  ? `Giảm phí vận chuyển (${order.couponCode})`
                  : `Mã giảm giá ${order.couponCode}`}
              </Text>
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

      <OrderActions order={order} />
      <ReturnSection order={order} />
    </div>
  );
}
