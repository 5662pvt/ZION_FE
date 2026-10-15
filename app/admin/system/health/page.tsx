"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Col, Row, Skeleton, Space, Switch, Typography } from "antd";
import { FiRefreshCw } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import HealthCheckCard from "@/components/admin/system/HealthCheckCard";
import { useSystemHealth } from "@/hooks/useSystem";

const CHECK_LABELS: Record<string, string> = {
  postgres: "PostgreSQL",
  redis: "Redis",
  rabbitmq: "RabbitMQ",
  worker: "Worker (RabbitMQ consumer)",
};

export default function AdminSystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading, isError, isFetching, refetch } = useSystemHealth(autoRefresh);

  return (
    <div>
      <PageHeader
        title="Sức khoẻ hệ thống"
        description="Giám sát tình trạng API, cơ sở dữ liệu, cache và hàng đợi"
        action={
          <Space>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} /> Tự động làm mới (15s)
            <Button icon={<FiRefreshCw aria-hidden />} loading={isFetching} onClick={() => void refetch()}>
              Làm mới
            </Button>
          </Space>
        }
      />

      {isError ? (
        <ErrorState message="Không tải được tình trạng hệ thống" onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <HealthCheckCard title="API" status={data.status} durationMs={data.totalDurationMs} description="Tổng trạng thái hệ thống" />
            </Col>
            {data.checks.map((check) => (
              <Col xs={24} sm={12} md={8} lg={6} key={check.name}>
                <HealthCheckCard
                  title={CHECK_LABELS[check.name] ?? check.name}
                  status={check.status}
                  durationMs={check.durationMs}
                  description={check.description}
                />
              </Col>
            ))}
          </Row>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 16 }}>
            Cập nhật lúc {dayjs(data.checkedAt).format("DD/MM/YYYY HH:mm:ss")}
          </Typography.Text>
        </>
      )}
    </div>
  );
}
