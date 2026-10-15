"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Button, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { paymentMethodLabel } from "@/utils/orderStatus";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { AdminOrderSummaryDto } from "@/types/adminOrders";

interface AdminOrderTableProps {
  items: AdminOrderSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function AdminOrderTable({ items, loading, pagination, onPageChange }: AdminOrderTableProps) {
  const router = useRouter();
  const columns: TableProps<AdminOrderSummaryDto>["columns"] = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      render: (code: string, record) => <Link href={`/admin/orders/${record.id}`}>{code}</Link>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Người nhận",
      key: "recipient",
      render: (_, record) => (
        <div>
          <div>{record.recipientName}</div>
          <div>{record.phoneNumber}</div>
        </div>
      ),
    },
    { title: "Số SP", dataIndex: "itemCount" },
    { title: "Tổng tiền", dataIndex: "total", render: (value: number) => formatVnd(value) },
    { title: "PTTT", dataIndex: "paymentMethod", render: (method: AdminOrderSummaryDto["paymentMethod"]) => paymentMethodLabel(method) },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AdminOrderSummaryDto["status"]) => <OrderStatusBadge status={status} />,
    },
  ];

  return (
    <ResponsiveTable<AdminOrderSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có đơn hàng"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.code}
          status={<OrderStatusBadge status={record.status} />}
          fields={[
            { label: "Ngày đặt", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") },
            { label: "Người nhận", value: `${record.recipientName} · ${record.phoneNumber}` },
            { label: "Số SP", value: record.itemCount },
            { label: "Tổng tiền", value: formatVnd(record.total) },
            { label: "PTTT", value: paymentMethodLabel(record.paymentMethod) },
          ]}
          action={
            <Button size="small" type="primary" onClick={() => router.push(`/admin/orders/${record.id}`)}>
              Xem chi tiết
            </Button>
          }
        />
      )}
    />
  );
}
