import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdminCustomerDetailDto,
  AdminCustomerListParams,
  AdminCustomerSummaryDto,
  LockCustomerResultDto,
} from "@/types/adminCustomers";

function buildQuery(params: AdminCustomerListParams): string {
  const search = new URLSearchParams();
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminCustomersService = {
  search: async (params: AdminCustomerListParams = {}): Promise<Paged<AdminCustomerSummaryDto>> => {
    const { data, pagination } = await apiGet<AdminCustomerSummaryDto[]>(`/api/v1/admin/customers${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: (id: string) => apiGet<AdminCustomerDetailDto>(`/api/v1/admin/customers/${id}`).then((r) => r.data),

  lock: (id: string) => apiPost<LockCustomerResultDto>(`/api/v1/admin/customers/${id}/lock`).then((r) => r.data),

  unlock: (id: string) => apiPost<LockCustomerResultDto>(`/api/v1/admin/customers/${id}/unlock`).then((r) => r.data),
};
