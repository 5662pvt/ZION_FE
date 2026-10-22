import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdjustLoyaltyPointsRequest,
  CustomerLoyaltyDto,
  LoyaltyTransactionDto,
  LoyaltyTransactionsParams,
} from "@/types/loyalty";

function buildQuery(params: LoyaltyTransactionsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.type) search.set("type", params.type);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminLoyaltyService = {
  getCustomerLoyalty: (userId: string) =>
    apiGet<CustomerLoyaltyDto>(`/api/v1/admin/loyalty/users/${userId}`).then((r) => r.data),

  getCustomerTransactions: async (
    userId: string,
    params: LoyaltyTransactionsParams = {}
  ): Promise<Paged<LoyaltyTransactionDto>> => {
    const { data, pagination } = await apiGet<LoyaltyTransactionDto[]>(
      `/api/v1/admin/loyalty/users/${userId}/transactions${buildQuery(params)}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  adjust: (userId: string, body: AdjustLoyaltyPointsRequest) =>
    apiPost<void>(`/api/v1/admin/loyalty/users/${userId}/adjust`, body).then((r) => r.data),
};
