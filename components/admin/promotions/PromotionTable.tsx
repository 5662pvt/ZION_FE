"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Table, Tag, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import type { PromotionDto, PromotionStatus, PromotionSummaryDto } from "@/types/promotions";

const STATUS_COLOR: Record<PromotionStatus, string> = {
  Active: "green",
  Inactive: "default",
  Scheduled: "blue",
  Expired: "red",
};

const STATUS_LABEL: Record<PromotionStatus, string> = {
  Active: "Đang chạy",
  Inactive: "Tạm tắt",
  Scheduled: "Sắp diễn ra",
  Expired: "Hết hạn",
};

function formatValue(promotion: Pick<PromotionDto, "type" | "value" | "maxDiscountAmount">): string {
  if (promotion.type === "FreeShipping") return "Miễn phí vận chuyển";
  if (promotion.type === "PercentageOff") {
    return promotion.maxDiscountAmount
      ? `${promotion.value}% (tối đa ${formatVnd(promotion.maxDiscountAmount)})`
      : `${promotion.value}%`;
  }
  return formatVnd(promotion.value);
}

function formatScope(promotion: Pick<PromotionSummaryDto, "scope" | "targetProductIds" | "targetCategoryIds">): string {
  if (promotion.scope === "Products") return `${promotion.targetProductIds.length} sản phẩm`;
  if (promotion.scope === "Categories") return `${promotion.targetCategoryIds.length} danh mục`;
  return "Toàn đơn";
}

interface PromotionTableProps {
  items: PromotionSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function PromotionTable({ items, loading, pagination, onPageChange }: PromotionTableProps) {
  const columns: TableProps<PromotionSummaryDto>["columns"] = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (name: string, record) => <Link href={`/admin/promotions/${record.id}`}>{name}</Link>,
    },
    {
      title: "Loại / Giá trị",
      key: "value",
      render: (_, record) => formatValue(record),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderSubtotal",
      render: (value: number) => formatVnd(value),
    },
    {
      title: "Phạm vi",
      key: "scope",
      render: (_, record) => formatScope(record),
    },
    {
      title: "Thời gian",
      key: "duration",
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startsAt).format("DD/MM/YYYY HH:mm")}</div>
          <div>{dayjs(record.endsAt).format("DD/MM/YYYY HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Lượt dùng",
      key: "usage",
      render: (_, record) => `${record.usedCount}/${record.usageLimit ?? "∞"}`,
    },
    { title: "Số mã", dataIndex: "couponCount" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: PromotionStatus) => <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>,
    },
  ];

  return (
    <Table<PromotionSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      locale={{ emptyText: "Chưa có khuyến mãi" }}
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
