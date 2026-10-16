import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCustomersService } from "@/services/adminCustomers.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdminCustomerListParams } from "@/types/adminCustomers";

export function useAdminCustomers(params: AdminCustomerListParams) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.list(params),
    queryFn: () => adminCustomersService.search(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminCustomer(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.detail(id),
    queryFn: () => adminCustomersService.getById(id),
    enabled,
  });
}

function useInvalidateAdminCustomers() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["customers", "admin", "list"] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.detail(id) });
  };
}

export function useLockCustomer() {
  const invalidate = useInvalidateAdminCustomers();
  return useMutation({
    mutationFn: (id: string) => adminCustomersService.lock(id),
    onSuccess: (_result, id) => invalidate(id),
  });
}

export function useUnlockCustomer() {
  const invalidate = useInvalidateAdminCustomers();
  return useMutation({
    mutationFn: (id: string) => adminCustomersService.unlock(id),
    onSuccess: (_result, id) => invalidate(id),
  });
}
