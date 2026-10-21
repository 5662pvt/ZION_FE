"use client";

import { Button, Space, type TableProps } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { StockLevelBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { InventoryItemDto } from "@/types/inventory";

interface InventoryTableProps {
  items: InventoryItemDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onAdjust: (item: InventoryItemDto) => void;
  onViewHistory: (item: InventoryItemDto) => void;
}

export default function InventoryTable({
  items,
  loading,
  pagination,
  onPageChange,
  onAdjust,
  onViewHistory,
}: InventoryTableProps) {
  const { hasRole } = useAuth();
  const canAdjust = hasRole(ROLES.Admin);

  const columns: TableProps<InventoryItemDto>["columns"] = [
    { title: "SKU", dataIndex: "sku" },
    {
      title: "Tên sản phẩm",
      key: "productName",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.productName}</span>
          {record.variantLabel && <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{record.variantLabel}</span>}
        </Space>
      ),
    },
    { title: "Tồn thực tế", dataIndex: "onHand", align: "right" },
    { title: "Đang giữ", dataIndex: "reserved", align: "right" },
    { title: "Có thể bán", dataIndex: "available", align: "right" },
    { title: "Ngưỡng", dataIndex: "lowStockThreshold", align: "right" },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        if (record.available <= 0) return <StockLevelBadge level="OutOfStock" />;
        if (record.isLowStock) return <StockLevelBadge level="LowStock" />;
        return null;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          {canAdjust && (
            <Button size="small" onClick={() => onAdjust(record)}>
              Điều chỉnh
            </Button>
          )}
          <Button size="small" onClick={() => onViewHistory(record)}>
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ResponsiveTable<InventoryItemDto>
      rowKey="variantId"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Không có dữ liệu tồn kho"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.variantLabel ? `${record.productName} — ${record.variantLabel}` : record.productName}
          status={
            record.available <= 0 ? (
              <StockLevelBadge level="OutOfStock" />
            ) : record.isLowStock ? (
              <StockLevelBadge level="LowStock" />
            ) : undefined
          }
          fields={[
            { label: "SKU", value: record.sku },
            { label: "Tồn thực tế", value: record.onHand },
            { label: "Đang giữ", value: record.reserved },
            { label: "Có thể bán", value: record.available },
            { label: "Ngưỡng", value: record.lowStockThreshold },
          ]}
          action={
            <>
              {canAdjust && (
                <Button size="small" onClick={() => onAdjust(record)}>
                  Điều chỉnh
                </Button>
              )}
              <Button size="small" onClick={() => onViewHistory(record)}>
                Lịch sử
              </Button>
            </>
          }
        />
      )}
    />
  );
}
