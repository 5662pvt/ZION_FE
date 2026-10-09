"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Result, Space, Spin, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import { usePaymentIntent, useSimulatePayment } from "@/hooks/usePayments";
import { useOrder } from "@/hooks/useOrders";

const { Text, Title } = Typography;

function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface FakeGatewayCardProps {
  intentId: string;
}

export default function FakeGatewayCard({ intentId }: FakeGatewayCardProps) {
  const router = useRouter();
  const { data: intent, isLoading, isError, error } = usePaymentIntent(intentId);
  // Không truyền pollWhilePending: false - tránh đăng ký một observer với polling
  // bị tắt lên cùng query key mà trang /orders/{id} đang dựa vào để poll trạng thái.
  const { data: order } = useOrder(intent?.orderId ?? "");
  const simulatePayment = useSimulatePayment();
  const [now, setNow] = useState(() => Date.now());
  const [activeAction, setActiveAction] = useState<"success" | "failure" | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return <Result status="404" title="Không tìm thấy phiên thanh toán" />;
  }

  if (isError || !intent) {
    return <Alert type="error" showIcon message="Không tải được phiên thanh toán" />;
  }

  const paymentIntent = intent;
  const orderCode = order?.code ?? paymentIntent.orderId.slice(0, 8).toUpperCase();
  const secondsLeft = Math.floor((new Date(paymentIntent.expiresAt).getTime() - now) / 1000);
  const isExpired = secondsLeft <= 0;
  const isPending = paymentIntent.status === "Pending";
  const isSubmitting = simulatePayment.isPending;

  const handleSimulate = (result: "success" | "failure") => {
    setActiveAction(result);
    simulatePayment.mutate(
      { intentId: paymentIntent.intentId, result },
      {
        onSuccess: () => {
          router.replace(`/orders/${paymentIntent.orderId}?payment=${result}`);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Xử lý thanh toán thất bại");
          setActiveAction(null);
        },
      },
    );
  };

  if (!isPending) {
    const resultStatus =
      paymentIntent.status === "Succeeded" ? "success" : paymentIntent.status === "Failed" ? "error" : "warning";
    const resultTitle =
      paymentIntent.status === "Succeeded"
        ? "Thanh toán thành công"
        : paymentIntent.status === "Failed"
          ? "Thanh toán thất bại"
          : "Thanh toán đã bị huỷ";

    return (
      <Card>
        <Result
          status={resultStatus}
          title={resultTitle}
          subTitle={`Mã đơn: ${orderCode}`}
          extra={
            <Link href={`/orders/${paymentIntent.orderId}`}>
              <Button type="primary">Xem đơn hàng</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Cổng thanh toán thử nghiệm">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Alert type="warning" showIcon message="Môi trường thử nghiệm — không trừ tiền thật" />

        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text type="secondary">Mã đơn</Text>
            <Text strong>{orderCode}</Text>
          </Space>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text type="secondary">Số tiền</Text>
            <Title level={5} style={{ margin: 0 }}>
              {formatVnd(paymentIntent.amount)}
            </Title>
          </Space>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text type="secondary">Hạn thanh toán</Text>
            <Text strong type={isExpired ? "danger" : undefined}>
              {isExpired ? "Đã hết hạn" : formatCountdown(secondsLeft)}
            </Text>
          </Space>
        </Space>

        {isExpired && <Alert type="error" showIcon message="Phiên thanh toán đã hết hạn" />}

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Button
            type="primary"
            block
            disabled={isExpired || isSubmitting}
            loading={activeAction === "success" && isSubmitting}
            onClick={() => handleSimulate("success")}
          >
            Thanh toán thành công
          </Button>
          <Button
            danger
            block
            disabled={isExpired || isSubmitting}
            loading={activeAction === "failure" && isSubmitting}
            onClick={() => handleSimulate("failure")}
          >
            Mô phỏng thất bại
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
