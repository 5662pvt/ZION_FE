"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Popconfirm, Radio, Space, Typography } from "antd";
import { useCancelOrder } from "@/hooks/useOrders";
import { useCreatePaymentIntent } from "@/hooks/usePayments";
import { canCustomerCancel } from "@/utils/orderStatus";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { OrderDto, OrderStatus } from "@/types/orders";
import type { PaymentChannel } from "@/types/payments";

const { Text } = Typography;

const NOT_CANCELLABLE_REASON: Partial<Record<OrderStatus, string>> = {
  Paid: "Đơn hàng đã thanh toán và đang được xử lý, không thể huỷ.",
  Shipped: "Đơn hàng đang giao, không thể huỷ.",
  Completed: "Đơn hàng đã hoàn tất, không thể huỷ.",
};

const CHANNEL_OPTIONS: Array<{ value: PaymentChannel; label: string }> = [
  { value: "Card", label: "Thẻ" },
  { value: "EWallet", label: "Ví điện tử" },
  { value: "BankTransfer", label: "Chuyển khoản" },
];

const RETRY_INTERVAL_MS = 3000;
const MAX_RETRIES = 5;

function payChannelStorageKey(orderId: string): string {
  return `zion:payChannel:${orderId}`;
}

function getRememberedChannel(orderId: string): PaymentChannel | null {
  try {
    const value = sessionStorage.getItem(payChannelStorageKey(orderId));
    return value === "Card" || value === "EWallet" || value === "BankTransfer" ? value : null;
  } catch {
    return null;
  }
}

function rememberChannel(orderId: string, channel: PaymentChannel): void {
  try {
    sessionStorage.setItem(payChannelStorageKey(orderId), channel);
  } catch {
    // sessionStorage có thể bị chặn (vd chế độ ẩn danh) - bỏ qua, chỉ mất tính năng nhớ kênh
  }
}

interface OrderActionsProps {
  order: OrderDto;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [channelChoice, setChannelChoice] = useState<PaymentChannel>("Card");
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [notReady, setNotReady] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const createPaymentIntent = useCreatePaymentIntent();
  const cancelOrder = useCancelOrder();

  const canPay = order.paymentMethod === "Online" && order.status === "AwaitingPayment";
  const canCancel = canCustomerCancel(order.status);
  const notCancellableReason = !canCancel ? NOT_CANCELLABLE_REASON[order.status] : undefined;

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Không setState ở đây: notReady/showChannelPicker đã được JSX gate theo canPay bên dưới,
  // chỉ cần dọn timer/ref để không retry nhầm vào đơn không còn chờ thanh toán.
  useEffect(() => {
    if (!canPay) {
      retryCountRef.current = 0;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    }
  }, [canPay]);

  if (!canPay && !canCancel && !notCancellableReason) return null;

  function createIntent(channel: PaymentChannel) {
    createPaymentIntent.mutate(
      { orderId: order.id, channel },
      {
        onSuccess: (intent) => {
          rememberChannel(order.id, channel);
          retryCountRef.current = 0;
          setNotReady(false);
          router.push(intent.redirectUrl ?? `/checkout/pay/${intent.intentId}`);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setNotReady(true);
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current += 1;
              retryTimerRef.current = setTimeout(() => createIntent(channel), RETRY_INTERVAL_MS);
            }
            return;
          }
          toast.error(err instanceof ApiError ? err.message : "Không tạo được giao dịch thanh toán. Vui lòng thử lại.");
        },
      }
    );
  }

  function handlePay() {
    setNotReady(false);
    retryCountRef.current = 0;
    const remembered = getRememberedChannel(order.id);
    if (remembered) {
      createIntent(remembered);
      return;
    }
    setShowChannelPicker(true);
  }

  function handleConfirmChannel() {
    setShowChannelPicker(false);
    createIntent(channelChoice);
  }

  function handleCancel() {
    cancelOrder.mutate(
      { id: order.id, body: reason.trim() ? { reason: reason.trim() } : undefined },
      {
        onSuccess: () => {
          toast.success("Đã huỷ đơn hàng");
          setReason("");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Huỷ đơn thất bại. Vui lòng thử lại."),
      }
    );
  }

  return (
    <Space direction="vertical" size={8} style={{ marginTop: 16 }}>
      <Space wrap>
        {canPay && !showChannelPicker && (
          <Button type="primary" loading={createPaymentIntent.isPending} onClick={handlePay}>
            Thanh toán ngay
          </Button>
        )}
        {canCancel && (
          <Popconfirm
            title="Huỷ đơn hàng này?"
            description={
              <Input
                placeholder="Lý do (không bắt buộc)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: 8, width: 220 }}
              />
            }
            okText="Huỷ đơn"
            cancelText="Đóng"
            okButtonProps={{ danger: true, loading: cancelOrder.isPending }}
            onConfirm={handleCancel}
          >
            <Button danger>Huỷ đơn</Button>
          </Popconfirm>
        )}
      </Space>
      {canPay && showChannelPicker && (
        <Space direction="vertical" size={8}>
          <Radio.Group value={channelChoice} onChange={(e) => setChannelChoice(e.target.value)}>
            <Space direction="vertical" size={4}>
              {CHANNEL_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
          <Space>
            <Button type="primary" loading={createPaymentIntent.isPending} onClick={handleConfirmChannel}>
              Tiếp tục thanh toán
            </Button>
            <Button onClick={() => setShowChannelPicker(false)}>Đóng</Button>
          </Space>
        </Space>
      )}
      {canPay && notReady && (
        <Alert type="info" showIcon message="Đơn hàng chưa sẵn sàng thanh toán, đang tự động thử lại…" />
      )}
      {notCancellableReason && <Text type="secondary">{notCancellableReason}</Text>}
    </Space>
  );
}
