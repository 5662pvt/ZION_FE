"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { returnReasonLabel } from "@/utils/returns";
import { ReturnStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { AdminReturnRequestDto } from "@/types/returns";

interface AdminReturnTableProps {
  items: AdminReturnRequestDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function AdminReturnTable({ items, loading, pagination, onPageChange }: AdminReturnTableProps) {
  const router = useRouter();

  const columns: TableProps<AdminReturnRequestDto>["columns"] = [
    {
      title: "Mã đơn",
      dataIndex: "orderCode",
      render: (code: string, record) => <Link href={`/admin/returns/${record.id}`}>{code}</Link>,
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
    {
      title: "Lý do",
      dataIndex: "reason",
      render: (reason: AdminReturnRequestDto["reason"]) => returnReasonLabel(reason),
    },
    { title: "Số tiền hoàn", dataIndex: "refundAmount", render: (value: number) => formatVnd(value) },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AdminReturnRequestDto["status"]) => <ReturnStatusBadge status={status} />,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <ResponsiveTable<AdminReturnRequestDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có yêu cầu trả hàng"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.orderCode}
          status={<ReturnStatusBadge status={record.status} />}
          fields={[
            { label: "Người nhận", value: `${record.recipientName} · ${record.phoneNumber}` },
            { label: "Lý do", value: returnReasonLabel(record.reason) },
            { label: "Số tiền hoàn", value: formatVnd(record.refundAmount) },
            { label: "Ngày yêu cầu", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") },
          ]}
          action={
            <Button size="small" type="primary" onClick={() => router.push(`/admin/returns/${record.id}`)}>
              Xem chi tiết
            </Button>
          }
        />
      )}
    />
  );
}
