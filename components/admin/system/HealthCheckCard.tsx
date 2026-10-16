import { Card, Typography } from "antd";
import { HealthStatusBadge } from "@/components/ui/StatusBadge";
import type { HealthStatus } from "@/types/system";

interface HealthCheckCardProps {
  title: string;
  status: HealthStatus;
  durationMs: number;
  description?: string | null;
}

export default function HealthCheckCard({ title, status, durationMs, description }: HealthCheckCardProps) {
  return (
    <Card
      title={title}
      extra={<HealthStatusBadge status={status} />}
      styles={{ title: { whiteSpace: "normal", overflow: "visible", textOverflow: "unset", lineHeight: 1.3 } }}
    >
      <Typography.Text type="secondary">{description ?? "—"}</Typography.Text>
      <div style={{ marginTop: 8, fontSize: 13, color: "var(--color-muted)" }}>{durationMs.toFixed(0)} ms</div>
    </Card>
  );
}
