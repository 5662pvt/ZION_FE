"use client";

import { Table, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import type { TopCategoryItemDto } from "@/types/reports";

interface TopCategoriesTableProps {
  items: TopCategoryItemDto[];
  loading: boolean;
}

export default function TopCategoriesTable({ items, loading }: TopCategoriesTableProps) {
  const columns: TableProps<TopCategoryItemDto>["columns"] = [
    { title: "Danh mục", dataIndex: "categoryName" },
    { title: "Số lượng", dataIndex: "quantity", align: "right" },
    {
      title: "Doanh thu (trước giảm giá)",
      dataIndex: "revenue",
      align: "right",
      render: (value: number) => formatVnd(value),
    },
  ];

  return (
    <Table<TopCategoryItemDto>
      rowKey={(record) => record.categoryId ?? "none"}
      loading={loading}
      dataSource={items}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "Không có dữ liệu" }}
    />
  );
}
