import { useQuery } from "@tanstack/react-query";
import { adminPaymentsService } from "@/services/adminPayments.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdminPaymentListParams } from "@/types/adminPayments";

export function useAdminPayments(params: AdminPaymentListParams) {
  return useQuery({
    queryKey: queryKeys.adminPayments.list(params),
    queryFn: () => adminPaymentsService.search(params),
    placeholderData: (previousData) => previousData,
  });
}
