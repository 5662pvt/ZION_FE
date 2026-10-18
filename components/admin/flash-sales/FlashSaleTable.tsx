"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Button, type TableProps } from "antd";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { FlashSaleSummaryDto } from "@/types/flashSales";

function FlashSaleStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <StatusBadge color="var(--color-success)">Đang chạy</StatusBadge>
  ) : (
    <StatusBadge color="var(--color-muted)">Tạm tắt</StatusBadge>
  );
}

interface FlashSaleTableProps {
  items: FlashSaleSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function FlashSaleTable({ items, loading, pagination, onPageChange }: FlashSaleTableProps) {
  const router = useRouter();
  const columns: TableProps<FlashSaleSummaryDto>["columns"] = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (name: string, record) => <Link href={`/admin/flash-sales/${record.id}`}>{name}</Link>,
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
    { title: "Số sản phẩm", dataIndex: "itemCount" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive: boolean) => <FlashSaleStatusBadge isActive={isActive} />,
    },
  ];

  return (
    <ResponsiveTable<FlashSaleSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có flash sale"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.name}
          status={<FlashSaleStatusBadge isActive={record.isActive} />}
          fields={[
            { label: "Thời gian", value: `${dayjs(record.startsAt).format("DD/MM/YYYY")} – ${dayjs(record.endsAt).format("DD/MM/YYYY")}` },
            { label: "Số sản phẩm", value: record.itemCount },
          ]}
          action={
            <Button size="small" onClick={() => router.push(`/admin/flash-sales/${record.id}`)}>
              Xem chi tiết
            </Button>
          }
        />
      )}
    />
  );
}
