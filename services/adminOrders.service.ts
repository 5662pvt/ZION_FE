import { apiGet, apiPost } from "./apiClient";
import { ordersService } from "./orders.service";
import type { Paged } from "@/types/api";
import type { AdminOrderListParams, AdminOrderSummaryDto } from "@/types/adminOrders";
import type { CancelOrderRequest, OrderDto } from "@/types/orders";

function buildAdminOrdersQuery(params: AdminOrderListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.keyword) search.set("keyword", params.keyword);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminOrdersService = {
  search: async (params: AdminOrderListParams = {}): Promise<Paged<AdminOrderSummaryDto>> => {
    const { data, pagination } = await apiGet<AdminOrderSummaryDto[]>(`/api/v1/orders${buildAdminOrdersQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: ordersService.getById,

  ship: (id: string) => apiPost<OrderDto>(`/api/v1/orders/${id}/ship`).then((r) => r.data),

  complete: (id: string) => apiPost<OrderDto>(`/api/v1/orders/${id}/complete`).then((r) => r.data),

  cancel: (id: string, body: CancelOrderRequest = {}) =>
    apiPost<OrderDto>(`/api/v1/orders/${id}/cancel`, body).then((r) => r.data),
};
