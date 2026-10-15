"use client";

import dayjs from "dayjs";
import { Alert, Descriptions, Drawer, Spin } from "antd";
import { OutboxStatusBadge } from "@/components/ui/StatusBadge";
import PayloadViewer from "./PayloadViewer";
import { useOutboxDetail } from "@/hooks/useSystem";
import type { OutboxMessageSummaryDto } from "@/types/system";

interface OutboxDetailDrawerProps {
  open: boolean;
  message: OutboxMessageSummaryDto | null;
  onClose: () => void;
}

export default function OutboxDetailDrawer({ open, message, onClose }: OutboxDetailDrawerProps) {
  const { data, isLoading, isError } = useOutboxDetail(message?.module ?? "", message?.id ?? "", open && !!message);

  return (
    <Drawer title={message ? `Chi tiết — ${message.eventType}` : "Chi tiết"} open={open} onClose={onClose} width={560} destroyOnHidden>
      {isError ? (
        <Alert type="error" message="Không tải được chi tiết thông báo" />
      ) : isLoading || !data ? (
        <Spin />
      ) : (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Module">{data.module}</Descriptions.Item>
            <Descriptions.Item label="Loại sự kiện">{data.eventType}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <OutboxStatusBadge status={data.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Thời điểm phát sinh">{dayjs(data.occurredOn).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
            <Descriptions.Item label="Thời điểm xử lý">
              {data.processedOn ? dayjs(data.processedOn).format("DD/MM/YYYY HH:mm:ss") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Số lần thử">{data.attempts}</Descriptions.Item>
            <Descriptions.Item label="Lỗi gần nhất">{data.lastError ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Trace">{data.traceParent ?? "—"}</Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 16, fontWeight: 600 }}>Payload</div>
          <div style={{ marginTop: 8 }}>
            <PayloadViewer payload={data.payload} />
          </div>
        </>
      )}
    </Drawer>
  );
}
