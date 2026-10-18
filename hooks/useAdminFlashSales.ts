import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashSalesService } from "@/services/flashSales.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AddFlashSaleItemRequest, FlashSaleListParams, FlashSaleUpsertRequest } from "@/types/flashSales";

export function useAdminFlashSales(params: FlashSaleListParams) {
  return useQuery({
    queryKey: queryKeys.flashSales.list(params),
    queryFn: () => flashSalesService.list(params),
  });
}

export function useAdminFlashSale(id: string) {
  return useQuery({
    queryKey: queryKeys.flashSales.detail(id),
    queryFn: () => flashSalesService.getById(id),
    enabled: !!id,
  });
}

function useInvalidateAdminFlashSales() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["flashSales", "admin", "list"] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.flashSales.detail(id) });
  };
}

export function useCreateFlashSale() {
  const invalidate = useInvalidateAdminFlashSales();
  return useMutation({
    mutationFn: (body: FlashSaleUpsertRequest) => flashSalesService.create(body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateFlashSale() {
  const invalidate = useInvalidateAdminFlashSales();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FlashSaleUpsertRequest }) => flashSalesService.update(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useActivateFlashSale() {
  const invalidate = useInvalidateAdminFlashSales();
  return useMutation({
    mutationFn: (id: string) => flashSalesService.activate(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useDeactivateFlashSale() {
  const invalidate = useInvalidateAdminFlashSales();
  return useMutation({
    mutationFn: (id: string) => flashSalesService.deactivate(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useAddFlashSaleItem() {
  const invalidate = useInvalidateAdminFlashSales();
  return useMutation({
    mutationFn: ({ flashSaleId, body }: { flashSaleId: string; body: AddFlashSaleItemRequest }) =>
      flashSalesService.addItem(flashSaleId, body),
    onSuccess: (_data, variables) => invalidate(variables.flashSaleId),
  });
}
