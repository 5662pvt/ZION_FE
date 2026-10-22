import { apiGet } from "./apiClient";
import type { Paged } from "@/types/api";
import type { LoyaltySummaryDto, LoyaltyTransactionDto, LoyaltyTransactionsParams } from "@/types/loyalty";

function buildQuery(params: LoyaltyTransactionsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.type) search.set("type", params.type);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const loyaltyService = {
  getMe: () => apiGet<LoyaltySummaryDto>("/api/v1/loyalty/me").then((r) => r.data),

  getMyTransactions: async (params: LoyaltyTransactionsParams = {}): Promise<Paged<LoyaltyTransactionDto>> => {
    const { data, pagination } = await apiGet<LoyaltyTransactionDto[]>(
      `/api/v1/loyalty/me/transactions${buildQuery(params)}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },
};
