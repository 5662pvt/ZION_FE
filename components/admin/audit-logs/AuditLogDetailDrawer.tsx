"use client";

import dayjs from "dayjs";
import { Descriptions, Drawer, Typography } from "antd";
import type { AuditLogDto } from "@/types/auditLogs";

interface AuditLogDetailDrawerProps {
  open: boolean;
  record: AuditLogDto | null;
  onClose: () => void;
}

export default function AuditLogDetailDrawer({ open, record, onClose }: AuditLogDetailDrawerProps) {
  return (
    <Drawer title="Chi tiết nhật ký thao tác" open={open} onClose={onClose} width={420}>
      {record && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Thời điểm">{dayjs(record.occurredAt).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
          <Descriptions.Item label="Người thực hiện">{record.actorEmail}</Descriptions.Item>
          <Descriptions.Item label="Hành động">{record.action}</Descriptions.Item>
          <Descriptions.Item label="Đối tượng">
            {record.resourceType} · {record.resourceId}
          </Descriptions.Item>
          <Descriptions.Item label="HTTP">
            {record.httpMethod} {record.path}
          </Descriptions.Item>
          <Descriptions.Item label="Mã trạng thái">{record.statusCode}</Descriptions.Item>
          <Descriptions.Item label="IP">{record.ipAddress}</Descriptions.Item>
          <Descriptions.Item label="Correlation ID">
            <Typography.Text copyable={{ text: record.correlationId }}>{record.correlationId}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trace ID">
            <Typography.Text copyable={{ text: record.traceId }}>{record.traceId}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
}
