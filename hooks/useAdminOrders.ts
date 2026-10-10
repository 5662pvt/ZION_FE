import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrdersService } from "@/services/adminOrders.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdminOrderListParams } from "@/types/adminOrders";
import type { CancelOrderRequest, OrderDto } from "@/types/orders";

export function useAdminOrders(params: AdminOrderListParams) {
  return useQuery({
    queryKey: queryKeys.adminOrders.list(params),
    queryFn: () => adminOrdersService.search(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => adminOrdersService.getById(id),
    enabled: !!id,
  });
}

function useInvalidateAdminOrders() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["orders", "admin", "list"] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
  };
}

export function useShipOrder() {
  const invalidate = useInvalidateAdminOrders();
  return useMutation({
    mutationFn: (id: string) => adminOrdersService.ship(id),
    onSuccess: (order: OrderDto) => invalidate(order.id),
  });
}

export function useCompleteOrder() {
  const invalidate = useInvalidateAdminOrders();
  return useMutation({
    mutationFn: (id: string) => adminOrdersService.complete(id),
    onSuccess: (order: OrderDto) => invalidate(order.id),
  });
}

export function useCancelAdminOrder() {
  const invalidate = useInvalidateAdminOrders();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: CancelOrderRequest }) => adminOrdersService.cancel(id, body),
    onSuccess: (order: OrderDto) => invalidate(order.id),
  });
}
