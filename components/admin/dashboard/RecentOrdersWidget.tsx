"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Card, List, Skeleton } from "antd";
import { formatVnd } from "@/utils/money";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useAdminOrders } from "@/hooks/useAdminOrders";

export default function RecentOrdersWidget() {
  const { data, isLoading, isError, refetch } = useAdminOrders({ page: 1, pageSize: 5 });

  return (
    <Card title="Đơn hàng gần đây" extra={<Link href="/admin/orders">Xem tất cả →</Link>}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isError ? (
        <ErrorState message="Không tải được đơn hàng gần đây" onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState description="Chưa có đơn hàng" />
      ) : (
        <List
          dataSource={data.items}
          renderItem={(order) => (
            <List.Item key={order.id} extra={<OrderStatusBadge status={order.status} />}>
              <List.Item.Meta
                title={<Link href={`/admin/orders/${order.id}`}>{order.code}</Link>}
                description={`${order.recipientName} · ${dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}`}
              />
              <div>{formatVnd(order.total)}</div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
