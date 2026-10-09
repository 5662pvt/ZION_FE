"use client";

import { useState } from "react";
import { Button, Input, Popconfirm, Space } from "antd";
import { useCancelOrder } from "@/hooks/useOrders";
import { useCreatePaymentIntent } from "@/hooks/usePayments";
import { canCustomerCancel } from "@/utils/orderStatus";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { OrderDto } from "@/types/orders";

interface OrderActionsProps {
  order: OrderDto;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const [reason, setReason] = useState("");
  const createPaymentIntent = useCreatePaymentIntent();
  const cancelOrder = useCancelOrder();

  const canPay = order.paymentMethod === "Online" && order.status === "AwaitingPayment";
  const canCancel = canCustomerCancel(order.status);

  if (!canPay && !canCancel) return null;

  function handlePay() {
    createPaymentIntent.mutate(order.id, {
      onSuccess: (intent) => {
        if (intent.redirectUrl) {
          window.location.href = intent.redirectUrl;
        } else {
          toast.info("Giao dịch thanh toán đang được chuẩn bị, vui lòng thử lại sau.");
        }
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          toast.info(err.message);
        } else {
          toast.error(err instanceof ApiError ? err.message : "Không tạo được giao dịch thanh toán. Vui lòng thử lại.");
        }
      },
    });
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
    <Space wrap style={{ marginTop: 16 }}>
      {canPay && (
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
  );
}
