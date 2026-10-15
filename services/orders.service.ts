import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type { CancelOrderRequest, MyOrdersParams, OrderDto, OrderSummaryDto, PlaceOrderRequest } from "@/types/orders";

function buildMyOrdersQuery(params: MyOrdersParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const ordersService = {
  placeOrder: (body: PlaceOrderRequest, idempotencyKey?: string) =>
    apiPost<OrderDto>(
      "/api/v1/orders",
      body,
      idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
    ).then((r) => r.data),

  getMyOrders: async (params: MyOrdersParams = {}): Promise<Paged<OrderSummaryDto>> => {
    const { data, pagination } = await apiGet<OrderSummaryDto[]>(`/api/v1/orders/mine${buildMyOrdersQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: (id: string) => apiGet<OrderDto>(`/api/v1/orders/${id}`).then((r) => r.data),

  cancel: (id: string, body: CancelOrderRequest = {}) =>
    apiPost<OrderDto>(`/api/v1/orders/${id}/cancel`, body).then((r) => r.data),
};
