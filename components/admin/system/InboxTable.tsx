"use client";

import dayjs from "dayjs";
import { Typography, type TableProps } from "antd";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { InboxMessageDto } from "@/types/system";

interface InboxTableProps {
  items: InboxMessageDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function InboxTable({ items, loading, pagination, onPageChange }: InboxTableProps) {
  const columns: TableProps<InboxMessageDto>["columns"] = [
    { title: "Thời điểm xử lý", dataIndex: "processedOn", render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss") },
    { title: "Module", dataIndex: "module" },
    { title: "Consumer", dataIndex: "consumer" },
    { title: "Loại sự kiện", dataIndex: "eventType" },
    {
      title: "Message ID",
      dataIndex: "messageId",
      render: (value: string) => <Typography.Text copyable={{ text: value }}>{value}</Typography.Text>,
    },
  ];

  return (
    <ResponsiveTable<InboxMessageDto>
      rowKey="messageId"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có thông báo inbox"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.eventType}
          fields={[
            { label: "Thời điểm xử lý", value: dayjs(record.processedOn).format("DD/MM/YYYY HH:mm:ss") },
            { label: "Module", value: record.module },
            { label: "Consumer", value: record.consumer },
            { label: "Message ID", value: <Typography.Text copyable={{ text: record.messageId }}>{record.messageId}</Typography.Text> },
          ]}
        />
      )}
    />
  );
}
