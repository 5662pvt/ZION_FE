"use client";

import dayjs from "dayjs";
import { Button, Popconfirm, Space, Tooltip, Typography, type TableProps } from "antd";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { DlqMessageDto } from "@/types/system";

interface DlqTableProps {
  items: DlqMessageDto[];
  loading: boolean;
  onView: (record: DlqMessageDto) => void;
  onRequeue: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  requeuePending: boolean;
  deletePending: boolean;
}

export default function DlqTable({ items, loading, onView, onRequeue, onDelete, requeuePending, deletePending }: DlqTableProps) {
  function renderActions(record: DlqMessageDto) {
    return (
      <Space>
        <Button size="small" onClick={() => onView(record)}>
          Xem payload
        </Button>
        <Popconfirm title="Đẩy lại thông báo này?" onConfirm={() => onRequeue(record.messageId)}>
          <Button size="small" type="primary" loading={requeuePending}>
            Đẩy lại
          </Button>
        </Popconfirm>
        <Popconfirm title="Xoá thông báo này khỏi hàng đợi lỗi?" onConfirm={() => onDelete(record.messageId)}>
          <Button size="small" danger loading={deletePending}>
            Xoá
          </Button>
        </Popconfirm>
      </Space>
    );
  }

  const columns: TableProps<DlqMessageDto>["columns"] = [
    {
      title: "Message ID",
      dataIndex: "messageId",
      render: (value: string) => <Typography.Text copyable={{ text: value }}>{value}</Typography.Text>,
    },
    { title: "Loại sự kiện", dataIndex: "eventType" },
    { title: "Lý do", dataIndex: "reason", ellipsis: true, render: (value: string) => <Tooltip title={value}>{value}</Tooltip> },
    { title: "Số lần chết", dataIndex: "deathCount", align: "right" },
    { title: "Lần đầu", dataIndex: "firstDeathAt", render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss") },
    {
      title: "Lỗi gần nhất",
      dataIndex: "lastError",
      ellipsis: true,
      render: (value: string | null) => (value ? <Tooltip title={value}>{value}</Tooltip> : "—"),
    },
    { title: "Thao tác", key: "actions", render: (_, record) => renderActions(record) },
  ];

  return (
    <ResponsiveTable<DlqMessageDto>
      rowKey="messageId"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Hàng đợi lỗi đang trống"
      pagination={{ current: 1, pageSize: items.length || 1, total: items.length }}
      onPageChange={() => {}}
      renderCard={(record) => (
        <ListCard
          title={record.eventType}
          fields={[
            { label: "Message ID", value: <Typography.Text copyable={{ text: record.messageId }}>{record.messageId}</Typography.Text> },
            { label: "Lý do", value: record.reason },
            { label: "Số lần chết", value: record.deathCount },
            { label: "Lần đầu", value: dayjs(record.firstDeathAt).format("DD/MM/YYYY HH:mm:ss") },
            { label: "Lỗi gần nhất", value: record.lastError ?? "—" },
          ]}
          action={renderActions(record)}
        />
      )}
    />
  );
}
