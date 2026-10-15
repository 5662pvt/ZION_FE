"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Alert, Button, Card, Flex, Result, Space, Spin, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import { usePaymentIntent, useSimulatePayment, useCreatePaymentIntent } from "@/hooks/usePayments";
import { useOrder } from "@/hooks/useOrders";
import type { PaymentChannel } from "@/types/payments";

const { Text, Title } = Typography;

const CHANNEL_LABELS: Record<PaymentChannel, string> = {
  Card: "Thẻ (Visa/Master/JCB)",
  EWallet: "Ví điện tử",
  BankTransfer: "Chuyển khoản ngân hàng",
};

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
  const { data: intent, isLoading, isError, error, refetch: refetchIntent } = usePaymentIntent(intentId);
  // Không truyền pollWhilePending: false - tránh đăng ký một observer với polling
  // bị tắt lên cùng query key mà trang /orders/{id} đang dựa vào để poll trạng thái.
  const { data: order } = useOrder(intent?.orderId ?? "");
  const simulatePayment = useSimulatePayment();
  const createPaymentIntent = useCreatePaymentIntent();
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
  const channelLabel = CHANNEL_LABELS[paymentIntent.channel];

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

  const handleRetry = () => {
    createPaymentIntent.mutate(
      { orderId: paymentIntent.orderId, channel: paymentIntent.channel },
      {
        onSuccess: (newIntent) => {
          router.replace(newIntent.redirectUrl ?? `/checkout/pay/${newIntent.intentId}`);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Không tạo được giao dịch thanh toán mới, vui lòng thử lại.");
        },
      },
    );
  };

  const backToOrderButton = (
    <Link href={`/orders/${paymentIntent.orderId}`}>
      <Button block>Quay lại đơn hàng</Button>
    </Link>
  );

  if (isPending && !isExpired) {
    return (
      <Card title="Cổng thanh toán thử nghiệm">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert type="warning" showIcon message="Môi trường thử nghiệm — không trừ tiền thật" />

          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Mã đơn</Text>
              <Text strong>{orderCode}</Text>
            </Flex>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Phương thức</Text>
              <Text strong>{channelLabel}</Text>
            </Flex>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Số tiền</Text>
              <Title level={5} style={{ margin: 0 }}>
                {formatVnd(paymentIntent.amount)}
              </Title>
            </Flex>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Hạn thanh toán</Text>
              <Text strong>{formatCountdown(secondsLeft)}</Text>
            </Flex>
          </Space>

          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Button
              type="primary"
              block
              disabled={isSubmitting}
              loading={activeAction === "success" && isSubmitting}
              onClick={() => handleSimulate("success")}
            >
              Thanh toán thành công
            </Button>
            <Button
              danger
              block
              disabled={isSubmitting}
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

  if ((isPending && isExpired) || paymentIntent.status === "Cancelled") {
    return (
      <Card>
        <Result
          status="warning"
          title={isPending ? "Phiên thanh toán đã hết hạn" : "Phiên thanh toán đã bị huỷ"}
          subTitle={`Mã đơn: ${orderCode}`}
          extra={
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Button block onClick={() => refetchIntent()}>
                Kiểm tra lại
              </Button>
              {backToOrderButton}
            </Space>
          }
        />
      </Card>
    );
  }

  if (paymentIntent.status === "Failed") {
    const canRetry = order?.status === "AwaitingPayment";
    return (
      <Card>
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={`Mã đơn: ${orderCode}`}
          extra={
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Text type="secondary">Giao dịch không thành công, vui lòng thử lại hoặc chọn phương thức khác.</Text>
              {canRetry && (
                <Button type="primary" block loading={createPaymentIntent.isPending} onClick={handleRetry}>
                  Thử lại
                </Button>
              )}
              {backToOrderButton}
            </Space>
          }
        />
      </Card>
    );
  }

  const paidAt = order?.history.find((h) => h.status === "Paid")?.at ?? paymentIntent.expiresAt;

  return (
    <Card>
      <Result
        status="success"
        title="Thanh toán thành công"
        subTitle={`Mã đơn: ${orderCode}`}
        extra={
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Số tiền</Text>
              <Text strong>{formatVnd(paymentIntent.amount)}</Text>
            </Flex>
            <Flex style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Thời điểm</Text>
              <Text strong>{dayjs(paidAt).format("DD/MM/YYYY HH:mm")}</Text>
            </Flex>
            <Link href={`/orders/${paymentIntent.orderId}`}>
              <Button type="primary" block style={{ marginTop: 8 }}>
                Xem đơn hàng
              </Button>
            </Link>
          </Space>
        }
      />
    </Card>
  );
}
