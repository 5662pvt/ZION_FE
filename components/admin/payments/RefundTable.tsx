"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Tooltip, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { refundMethodLabel } from "@/utils/returns";
import { RefundStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { RefundDto, RefundMethod } from "@/types/returns";

interface RefundTableProps {
  items: RefundDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function RefundTable({ items, loading, pagination, onPageChange }: RefundTableProps) {
  const columns: TableProps<RefundDto>["columns"] = [
    {
      title: "Thời điểm",
      dataIndex: "createdAt",
      width: 160,
      render: (value: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(value).format("DD/MM/YYYY HH:mm:ss")}</span>,
    },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      width: 90,
      render: (orderId: string) => <Link href={`/admin/orders/${orderId}`}>{orderId.slice(0, 8)}</Link>,
    },
    { title: "Số tiền", dataIndex: "amount", width: 110, render: (value: number) => formatVnd(value) },
    {
      title: "Phương thức",
      dataIndex: "method",
      width: 130,
      render: (method: string) => refundMethodLabel(method as RefundMethod),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 100,
      render: (status: RefundDto["status"]) => <RefundStatusBadge status={status} />,
    },
    {
      title: "Lý do lỗi",
      dataIndex: "failureReason",
      width: 150,
      ellipsis: true,
      render: (value: string | null) => (value ? <Tooltip title={value}>{value}</Tooltip> : "—"),
    },
    {
      title: "Hoàn tất lúc",
      dataIndex: "completedAt",
      width: 160,
      render: (value: string | null) => (
        <span style={{ whiteSpace: "nowrap" }}>{value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "—"}</span>
      ),
    },
  ];

  return (
    <ResponsiveTable<RefundDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      scrollX={900}
      emptyText="Chưa có giao dịch hoàn tiền"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={formatVnd(record.amount)}
          status={<RefundStatusBadge status={record.status} />}
          fields={[
            { label: "Thời điểm", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm:ss") },
            {
              label: "Mã đơn",
              value: <Link href={`/admin/orders/${record.orderId}`}>{record.orderId.slice(0, 8)}</Link>,
            },
            { label: "Phương thức", value: refundMethodLabel(record.method as RefundMethod) },
            { label: "Lý do lỗi", value: record.failureReason ?? "—" },
            {
              label: "Hoàn tất lúc",
              value: record.completedAt ? dayjs(record.completedAt).format("DD/MM/YYYY HH:mm:ss") : "—",
            },
          ]}
        />
      )}
    />
  );
}
