"use client";

import dayjs from "dayjs";
import { Button, Popconfirm, Space, Tooltip, type TableProps } from "antd";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { useRetryOutbox } from "@/hooks/useSystem";
import { OutboxStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { OutboxMessageSummaryDto } from "@/types/system";

interface OutboxTableProps {
  items: OutboxMessageSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onView: (record: OutboxMessageSummaryDto) => void;
}

export default function OutboxTable({ items, loading, pagination, onPageChange, onView }: OutboxTableProps) {
  const retryOutbox = useRetryOutbox();

  function handleRetry(record: OutboxMessageSummaryDto) {
    retryOutbox.mutate(
      { module: record.module, id: record.id },
      {
        onSuccess: () => toast.success("Đã đưa về hàng chờ gửi lại"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi lại thất bại. Vui lòng thử lại."),
      }
    );
  }

  function renderActions(record: OutboxMessageSummaryDto) {
    return (
      <Space>
        <Button size="small" onClick={() => onView(record)}>
          Xem
        </Button>
        {record.status === "Failed" && (
          <Popconfirm title="Gửi lại thông báo này?" onConfirm={() => handleRetry(record)}>
            <Button size="small" type="primary" loading={retryOutbox.isPending}>
              Gửi lại
            </Button>
          </Popconfirm>
        )}
      </Space>
    );
  }

  const columns: TableProps<OutboxMessageSummaryDto>["columns"] = [
    { title: "Thời điểm", dataIndex: "occurredOn", render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss") },
    { title: "Module", dataIndex: "module" },
    { title: "Loại sự kiện", dataIndex: "eventType" },
    { title: "Trạng thái", dataIndex: "status", render: (status: OutboxMessageSummaryDto["status"]) => <OutboxStatusBadge status={status} /> },
    { title: "Số lần thử", dataIndex: "attempts", align: "right" },
    {
      title: "Lỗi gần nhất",
      dataIndex: "lastError",
      ellipsis: true,
      render: (value: string | null) => (value ? <Tooltip title={value}>{value}</Tooltip> : "—"),
    },
    { title: "Thao tác", key: "actions", render: (_, record) => renderActions(record) },
  ];

  return (
    <ResponsiveTable<OutboxMessageSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có thông báo outbox"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.eventType}
          status={<OutboxStatusBadge status={record.status} />}
          fields={[
            { label: "Thời điểm", value: dayjs(record.occurredOn).format("DD/MM/YYYY HH:mm:ss") },
            { label: "Module", value: record.module },
            { label: "Số lần thử", value: record.attempts },
            { label: "Lỗi gần nhất", value: record.lastError ?? "—" },
          ]}
          action={renderActions(record)}
        />
      )}
    />
  );
}
