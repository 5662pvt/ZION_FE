import { useQuery } from "@tanstack/react-query";
import { loyaltyService } from "@/services/loyalty.service";
import { queryKeys } from "@/constants/queryKeys";
import type { LoyaltyTransactionsParams } from "@/types/loyalty";

export function useMyLoyalty() {
  return useQuery({
    queryKey: queryKeys.loyalty.me,
    queryFn: () => loyaltyService.getMe(),
  });
}

export function useMyLoyaltyTransactions(params: LoyaltyTransactionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.loyalty.myTransactions(params),
    queryFn: () => loyaltyService.getMyTransactions(params),
    placeholderData: (previousData) => previousData,
  });
}
