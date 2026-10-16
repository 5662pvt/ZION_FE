"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Tooltip, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { AdminPaymentDto } from "@/types/adminPayments";

const CHANNEL_LABELS: Record<AdminPaymentDto["channel"], string> = {
  Card: "Thẻ",
  EWallet: "Ví điện tử",
  BankTransfer: "Chuyển khoản",
};

interface PaymentTableProps {
  items: AdminPaymentDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function PaymentTable({ items, loading, pagination, onPageChange }: PaymentTableProps) {
  const columns: TableProps<AdminPaymentDto>["columns"] = [
    { title: "Thời điểm", dataIndex: "createdAt", render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss") },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      render: (orderId: string) => <Link href={`/admin/orders/${orderId}`}>{orderId.slice(0, 8)}</Link>,
    },
    { title: "Số tiền", dataIndex: "amount", render: (value: number) => formatVnd(value) },
    { title: "Kênh", dataIndex: "channel", render: (channel: AdminPaymentDto["channel"]) => CHANNEL_LABELS[channel] },
    { title: "Nhà cung cấp", dataIndex: "provider" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AdminPaymentDto["status"]) => <PaymentStatusBadge status={status} />,
    },
    {
      title: "Lý do lỗi",
      dataIndex: "failureReason",
      ellipsis: true,
      render: (value: string | null) => (value ? <Tooltip title={value}>{value}</Tooltip> : "—"),
    },
    {
      title: "Hoàn tất lúc",
      dataIndex: "completedAt",
      render: (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "—"),
    },
  ];

  return (
    <ResponsiveTable<AdminPaymentDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có giao dịch thanh toán"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={formatVnd(record.amount)}
          status={<PaymentStatusBadge status={record.status} />}
          fields={[
            { label: "Thời điểm", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm:ss") },
            { label: "Mã đơn", value: <Link href={`/admin/orders/${record.orderId}`}>{record.orderId.slice(0, 8)}</Link> },
            { label: "Kênh", value: CHANNEL_LABELS[record.channel] },
            { label: "Nhà cung cấp", value: record.provider },
            { label: "Lý do lỗi", value: record.failureReason ?? "—" },
            { label: "Hoàn tất lúc", value: record.completedAt ? dayjs(record.completedAt).format("DD/MM/YYYY HH:mm:ss") : "—" },
          ]}
        />
      )}
    />
  );
}
