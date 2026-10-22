import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminLoyaltyService } from "@/services/adminLoyalty.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdjustLoyaltyPointsRequest, LoyaltyTransactionsParams } from "@/types/loyalty";

export function useCustomerLoyalty(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminLoyalty.detail(userId),
    queryFn: () => adminLoyaltyService.getCustomerLoyalty(userId),
    enabled,
  });
}

export function useCustomerLoyaltyTransactions(userId: string, params: LoyaltyTransactionsParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminLoyalty.transactions(userId, params),
    queryFn: () => adminLoyaltyService.getCustomerTransactions(userId, params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useAdjustLoyaltyPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: AdjustLoyaltyPointsRequest }) =>
      adminLoyaltyService.adjust(userId, body),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLoyalty.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ["loyalty", "admin", "transactions", userId] });
    },
  });
}
