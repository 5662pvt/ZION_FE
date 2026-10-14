"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { queryKeys } from "@/constants/queryKeys";
import type { CancelOrderRequest, MyOrdersParams, OrderDto, PlaceOrderRequest } from "@/types/orders";

export function useMyOrders(params: MyOrdersParams = {}) {
  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => ordersService.getMyOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
    // "always": mỗi lần component (re)subscribe - mount thật hoặc được Next 16
    // Activity hiện lại sau khi quay về từ trang khác - đều lấy dữ liệu mới nhất
    // thay vì tin vào cache cũ.
    refetchOnMount: "always",
  });
}

const POLLING_STATUSES = new Set(["PendingStock", "AwaitingPayment"]);
const MAX_POLLING_MS = 3 * 60 * 1000;
const POLLING_INTERVAL_MS = 2000;

// setInterval trong effect thay cho refetchInterval của TanStack Query: effect bị dọn
// khi Next 16 Activity ẩn trang và chạy lại khi hiện lại, nên không còn kẹt khi
// refetchInterval âm thầm không re-arm sau khi quay lại từ cổng thanh toán.
export function useOrderPolling(id: string, status: string | undefined, refetch: () => void) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!id || !status || !POLLING_STATUSES.has(status)) {
      return;
    }
    const startedAt = Date.now();
    refetch();
    const intervalId = setInterval(() => {
      if (Date.now() - startedAt >= MAX_POLLING_MS) {
        setTimedOut(true);
        clearInterval(intervalId);
        return;
      }
      refetch();
    }, POLLING_INTERVAL_MS);
    // Dọn khi status đổi (vd chuyển Confirmed) hoặc unmount - đưa timedOut về false
    // để lần poll kế tiếp (nếu có) không bị kẹt ở cảnh báo cũ.
    return () => {
      clearInterval(intervalId);
      setTimedOut(false);
    };
  }, [id, status, refetch]);

  return { timedOut };
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: PlaceOrderRequest; idempotencyKey?: string }) =>
      ordersService.placeOrder(body, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: CancelOrderRequest }) => ordersService.cancel(id, body),
    onSuccess: (order: OrderDto) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    },
  });
}
