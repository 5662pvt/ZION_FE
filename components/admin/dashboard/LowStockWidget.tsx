"use client";

import Link from "next/link";
import { Card, List, Skeleton, Typography } from "antd";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useAdminInventory } from "@/hooks/useAdminInventory";

export default function LowStockWidget() {
  const { data, isLoading, isError, refetch } = useAdminInventory({ page: 1, pageSize: 5, lowStockOnly: true });

  return (
    <Card title="Cảnh báo tồn kho" extra={<Link href="/admin/inventory?lowStockOnly=true">Xem tất cả →</Link>}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isError ? (
        <ErrorState message="Không tải được cảnh báo tồn kho" onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState description="Không có sản phẩm sắp hết hàng" />
      ) : (
        <List
          dataSource={data.items}
          renderItem={(item) => (
            <List.Item key={item.productId}>
              <List.Item.Meta title={item.productName} description={`SKU: ${item.sku}`} />
              <Typography.Text type="danger">
                Còn {item.available} / ngưỡng {item.lowStockThreshold}
              </Typography.Text>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
