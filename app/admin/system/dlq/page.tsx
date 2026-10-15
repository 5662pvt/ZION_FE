"use client";

import { useState } from "react";
import { Button, Popconfirm, Select, Space, Switch, Typography } from "antd";
import { FiRefreshCw } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import DlqTable from "@/components/admin/system/DlqTable";
import DlqPayloadDrawer from "@/components/admin/system/DlqPayloadDrawer";
import { useDeleteDlq, useDlqPeek, useRequeueDlq } from "@/hooks/useSystem";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { DlqMessageDto } from "@/types/system";

const LIMIT_OPTIONS = [10, 20, 50, 100].map((value) => ({ value, label: `${value}` }));

export default function AdminSystemDlqPage() {
  const [limit, setLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [viewing, setViewing] = useState<DlqMessageDto | null>(null);

  const { data, isLoading, isError, isFetching, error, refetch } = useDlqPeek(limit, autoRefresh);
  const requeueDlq = useRequeueDlq();
  const deleteDlq = useDeleteDlq();

  function handleRequeueOne(messageId: string) {
    requeueDlq.mutate([messageId], {
      onSuccess: (result) => toast.success(`Đã đẩy lại ${result.requeued} thông báo`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Đẩy lại thất bại. Vui lòng thử lại."),
    });
  }

  function handleRequeueAll() {
    requeueDlq.mutate(undefined, {
      onSuccess: (result) => toast.success(`Đã đẩy lại ${result.requeued} thông báo`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Đẩy lại thất bại. Vui lòng thử lại."),
    });
  }

  function handleDelete(messageId: string) {
    deleteDlq.mutate(messageId, {
      onSuccess: () => toast.success("Đã xoá thông báo"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá thất bại. Vui lòng thử lại."),
    });
  }

  const isBrokerUnavailable = error instanceof ApiError && error.status === 503;

  return (
    <div>
      <PageHeader
        title="Hàng đợi lỗi (DLQ)"
        description="Xem và xử lý thông báo bị chuyển vào hàng đợi lỗi của RabbitMQ"
        action={
          <Space>
            <Select value={limit} options={LIMIT_OPTIONS} style={{ width: 90 }} onChange={setLimit} />
            <Switch checked={autoRefresh} onChange={setAutoRefresh} /> Tự động làm mới (15s)
            <Button icon={<FiRefreshCw aria-hidden />} loading={isFetching} onClick={() => void refetch()}>
              Làm mới
            </Button>
          </Space>
        }
      />

      {isError ? (
        <ErrorState
          message={isBrokerUnavailable ? "Không kết nối được RabbitMQ" : "Không tải được hàng đợi lỗi"}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <Space align="center" style={{ marginBottom: 16 }} wrap>
            <Typography.Text>
              Hàng đợi: <Typography.Text strong>{data?.queue ?? "—"}</Typography.Text> · Số thông báo:{" "}
              <Typography.Text strong>{data?.messageCount ?? 0}</Typography.Text>
            </Typography.Text>
            <Popconfirm title="Đẩy lại tất cả thông báo trong hàng đợi lỗi?" onConfirm={handleRequeueAll}>
              <Button danger loading={requeueDlq.isPending}>
                Đẩy lại tất cả
              </Button>
            </Popconfirm>
          </Space>

          <DlqTable
            items={data?.messages ?? []}
            loading={isLoading}
            onView={setViewing}
            onRequeue={handleRequeueOne}
            onDelete={handleDelete}
            requeuePending={requeueDlq.isPending}
            deletePending={deleteDlq.isPending}
          />
        </>
      )}

      <DlqPayloadDrawer open={!!viewing} message={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
