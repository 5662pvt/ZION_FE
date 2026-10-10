"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Table, Tag, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { orderStatusColor, orderStatusLabel, paymentMethodLabel } from "@/utils/orderStatus";
import type { AdminOrderSummaryDto } from "@/types/adminOrders";

interface AdminOrderTableProps {
  items: AdminOrderSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function AdminOrderTable({ items, loading, pagination, onPageChange }: AdminOrderTableProps) {
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
      render: (status: AdminOrderSummaryDto["status"]) => <Tag color={orderStatusColor(status)}>{orderStatusLabel(status)}</Tag>,
    },
  ];

  return (
    <Table<AdminOrderSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      locale={{ emptyText: "Chưa có đơn hàng" }}
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
