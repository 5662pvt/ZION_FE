"use client";

import { Table, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { PROMOTION_TYPE_LABEL } from "./promotionLabels";
import type { PromotionPerformanceItemDto } from "@/types/reports";

interface PromotionPerformanceTableProps {
  items: PromotionPerformanceItemDto[];
  loading: boolean;
}

export default function PromotionPerformanceTable({ items, loading }: PromotionPerformanceTableProps) {
  const columns: TableProps<PromotionPerformanceItemDto>["columns"] = [
    { title: "Chương trình", dataIndex: "promotionName" },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type: PromotionPerformanceItemDto["type"]) => PROMOTION_TYPE_LABEL[type],
    },
    { title: "Số đơn", dataIndex: "orders", align: "right" },
    { title: "Tổng giảm", dataIndex: "discountTotal", align: "right", render: (value: number) => formatVnd(value) },
    { title: "SL quà tặng", dataIndex: "giftQuantity", align: "right" },
  ];

  return (
    <Table<PromotionPerformanceItemDto>
      rowKey="promotionId"
      loading={loading}
      dataSource={items}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "Chưa có dữ liệu khuyến mãi" }}
    />
  );
}
