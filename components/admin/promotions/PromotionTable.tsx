"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Button, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { PromotionStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { PromotionDto, PromotionStatus, PromotionSummaryDto } from "@/types/promotions";

function formatValue(promotion: Pick<PromotionDto, "type" | "value" | "maxDiscountAmount" | "giftItems">): string {
  if (promotion.type === "Gift") return `Tặng ${promotion.giftItems.length} sản phẩm`;
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
  const router = useRouter();
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
      render: (status: PromotionStatus) => <PromotionStatusBadge status={status} />,
    },
  ];

  return (
    <ResponsiveTable<PromotionSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có khuyến mãi"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.name}
          status={<PromotionStatusBadge status={record.status} />}
          fields={[
            { label: "Loại / Giá trị", value: formatValue(record) },
            { label: "Đơn tối thiểu", value: formatVnd(record.minOrderSubtotal) },
            { label: "Phạm vi", value: formatScope(record) },
            { label: "Thời gian", value: `${dayjs(record.startsAt).format("DD/MM/YYYY")} – ${dayjs(record.endsAt).format("DD/MM/YYYY")}` },
            { label: "Lượt dùng", value: `${record.usedCount}/${record.usageLimit ?? "∞"}` },
          ]}
          action={
            <Button size="small" onClick={() => router.push(`/admin/promotions/${record.id}`)}>
              Xem chi tiết
            </Button>
          }
        />
      )}
    />
  );
}
