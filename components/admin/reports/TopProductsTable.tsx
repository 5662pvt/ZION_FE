"use client";

import { Table, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import type { TopProductItemDto } from "@/types/reports";

interface TopProductsTableProps {
  items: TopProductItemDto[];
  loading: boolean;
}

export default function TopProductsTable({ items, loading }: TopProductsTableProps) {
  const columns: TableProps<TopProductItemDto>["columns"] = [
    { title: "Sản phẩm", dataIndex: "productName" },
    { title: "Số lượng", dataIndex: "quantity", align: "right" },
    { title: "Số đơn", dataIndex: "orders", align: "right" },
    {
      title: "Doanh thu (trước giảm giá)",
      dataIndex: "revenue",
      align: "right",
      render: (value: number) => formatVnd(value),
    },
  ];

  return (
    <Table<TopProductItemDto>
      rowKey="productId"
      loading={loading}
      dataSource={items}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "Không có dữ liệu" }}
    />
  );
}
