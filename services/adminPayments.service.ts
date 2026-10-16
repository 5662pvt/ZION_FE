import { apiGet } from "./apiClient";
import type { Paged } from "@/types/api";
import type { AdminPaymentDto, AdminPaymentListParams } from "@/types/adminPayments";

function buildQuery(params: AdminPaymentListParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.channel) search.set("channel", params.channel);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.orderId) search.set("orderId", params.orderId);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminPaymentsService = {
  search: async (params: AdminPaymentListParams = {}): Promise<Paged<AdminPaymentDto>> => {
    const { data, pagination } = await apiGet<AdminPaymentDto[]>(`/api/v1/admin/payments${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },
};
