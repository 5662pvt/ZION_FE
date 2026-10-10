"use client";

import { useState } from "react";
import { Button, Input, Popconfirm, Space } from "antd";
import { useCancelAdminOrder, useCompleteOrder, useShipOrder } from "@/hooks/useAdminOrders";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { OrderDto, OrderStatus } from "@/types/orders";

const SHIPPABLE_STATUSES = new Set<OrderStatus>(["Confirmed", "Paid"]);
const COMPLETABLE_STATUSES = new Set<OrderStatus>(["Shipped"]);
const CANCELLABLE_STATUSES = new Set<OrderStatus>(["PendingStock", "AwaitingPayment", "Confirmed", "Paid"]);

interface AdminOrderActionsProps {
  order: OrderDto;
}

export default function AdminOrderActions({ order }: AdminOrderActionsProps) {
  const [reason, setReason] = useState("");
  const shipOrder = useShipOrder();
  const completeOrder = useCompleteOrder();
  const cancelOrder = useCancelAdminOrder();

  const canShip = SHIPPABLE_STATUSES.has(order.status);
  const canComplete = COMPLETABLE_STATUSES.has(order.status);
  const canCancel = CANCELLABLE_STATUSES.has(order.status);

  if (!canShip && !canComplete && !canCancel) return null;

  function handleShip() {
    shipOrder.mutate(order.id, {
      onSuccess: () => toast.success("Đã chuyển đơn sang giao hàng"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật thất bại. Vui lòng thử lại."),
    });
  }

  function handleComplete() {
    completeOrder.mutate(order.id, {
      onSuccess: () => toast.success("Đã hoàn tất đơn hàng"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật thất bại. Vui lòng thử lại."),
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
      {canShip && (
        <Popconfirm title="Chuyển đơn này sang giao hàng?" onConfirm={handleShip}>
          <Button type="primary" loading={shipOrder.isPending}>
            Giao hàng
          </Button>
        </Popconfirm>
      )}
      {canComplete && (
        <Popconfirm title="Hoàn tất đơn hàng này?" onConfirm={handleComplete}>
          <Button type="primary" loading={completeOrder.isPending}>
            Hoàn tất
          </Button>
        </Popconfirm>
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
