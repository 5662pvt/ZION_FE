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

const DEFAULT_POLLING_STATUSES = ["PendingStock", "AwaitingPayment"];
const DEFAULT_MAX_POLLING_MS = 3 * 60 * 1000;
const DEFAULT_POLLING_INTERVAL_MS = 2000;

interface UseOrderPollingOptions {
  statuses?: readonly string[];
  intervalMs?: number;
  maxMs?: number;
}

// setInterval trong effect thay cho refetchInterval của TanStack Query: effect bị dọn
// khi Next 16 Activity ẩn trang và chạy lại khi hiện lại, nên không còn kẹt khi
// refetchInterval âm thầm không re-arm sau khi quay lại từ cổng thanh toán.
export function useOrderPolling(
  id: string,
  status: string | undefined,
  refetch: () => void,
  options: UseOrderPollingOptions = {}
) {
  const {
    statuses = DEFAULT_POLLING_STATUSES,
    intervalMs = DEFAULT_POLLING_INTERVAL_MS,
    maxMs = DEFAULT_MAX_POLLING_MS,
  } = options;
  const [timedOut, setTimedOut] = useState(false);
  // Chuyển statuses thành chuỗi ổn định để literal array truyền inline mỗi render
  // không làm effect re-arm không cần thiết.
  const statusesKey = statuses.join(",");

  useEffect(() => {
    const pollingStatuses = new Set(statusesKey.split(","));
    if (!id || !status || !pollingStatuses.has(status)) {
      return;
    }
    const startedAt = Date.now();
    refetch();
    const intervalId = setInterval(() => {
      if (Date.now() - startedAt >= maxMs) {
        setTimedOut(true);
        clearInterval(intervalId);
        return;
      }
      refetch();
    }, intervalMs);
    // Dọn khi status đổi (vd chuyển Confirmed) hoặc unmount - đưa timedOut về false
    // để lần poll kế tiếp (nếu có) không bị kẹt ở cảnh báo cũ.
    return () => {
      clearInterval(intervalId);
      setTimedOut(false);
    };
  }, [id, status, refetch, statusesKey, intervalMs, maxMs]);

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
      // BE xoá giỏ hàng bất đồng bộ sau OrderCreated - invalidate lại sau khoảng trễ
      // để badge giỏ hàng không bị kẹt số cũ khi lần invalidate đầu còn trước lúc BE xử lý.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      }, 3000);
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
