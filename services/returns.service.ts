import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdminRefundListParams,
  AdminReturnListParams,
  AdminReturnRequestDto,
  MarkShippedBackBody,
  RefundDto,
  RejectReturnBody,
  RequestReturnBody,
  ReturnRequestDto,
} from "@/types/returns";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const returnsService = {
  requestReturn: (orderId: string, body: RequestReturnBody) =>
    apiPost<ReturnRequestDto>(`/api/v1/orders/${orderId}/return`, body).then((r) => r.data),

  getForOrder: (orderId: string) =>
    apiGet<ReturnRequestDto | null>(`/api/v1/orders/${orderId}/return`).then((r) => r.data),

  markShippedBack: (id: string, body: MarkShippedBackBody = {}) =>
    apiPost<ReturnRequestDto>(`/api/v1/returns/${id}/shipped-back`, body).then((r) => r.data),

  adminSearch: async (params: AdminReturnListParams = {}): Promise<Paged<AdminReturnRequestDto>> => {
    const { data, pagination } = await apiGet<AdminReturnRequestDto[]>(
      `/api/v1/admin/returns${buildQuery({ page: params.page, pageSize: params.pageSize, status: params.status })}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  adminGetById: (id: string) => apiGet<AdminReturnRequestDto>(`/api/v1/admin/returns/${id}`).then((r) => r.data),

  approve: (id: string) => apiPost<AdminReturnRequestDto>(`/api/v1/admin/returns/${id}/approve`).then((r) => r.data),

  reject: (id: string, body: RejectReturnBody) =>
    apiPost<AdminReturnRequestDto>(`/api/v1/admin/returns/${id}/reject`, body).then((r) => r.data),

  markReceived: (id: string) =>
    apiPost<AdminReturnRequestDto>(`/api/v1/admin/returns/${id}/received`).then((r) => r.data),

  adminListRefunds: async (params: AdminRefundListParams = {}): Promise<Paged<RefundDto>> => {
    const { data, pagination } = await apiGet<RefundDto[]>(
      `/api/v1/admin/refunds${buildQuery({ page: params.page, pageSize: params.pageSize, status: params.status })}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },
};
