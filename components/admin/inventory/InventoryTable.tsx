"use client";

import { Button, Space, Table, Tag, type TableProps } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
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
    { title: "Tên sản phẩm", dataIndex: "productName" },
    { title: "Tồn thực tế", dataIndex: "onHand", align: "right" },
    { title: "Đang giữ", dataIndex: "reserved", align: "right" },
    { title: "Có thể bán", dataIndex: "available", align: "right" },
    { title: "Ngưỡng", dataIndex: "lowStockThreshold", align: "right" },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        if (record.available <= 0) return <Tag color="red">Hết hàng</Tag>;
        if (record.isLowStock) return <Tag color="orange">Sắp hết</Tag>;
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
    <Table<InventoryItemDto>
      rowKey="productId"
      loading={loading}
      dataSource={items}
      columns={columns}
      locale={{ emptyText: "Không có dữ liệu tồn kho" }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
}
