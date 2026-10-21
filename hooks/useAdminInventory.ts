import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdjustStockRequest, InventoryListParams, StockMovementsParams } from "@/types/inventory";

export function useAdminInventory(params: InventoryListParams) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryService.search(params),
  });
}

export function useStockMovements(productId: string, params: StockMovementsParams) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(productId, params),
    queryFn: () => inventoryService.movements(productId, params),
    enabled: !!productId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: AdjustStockRequest }) =>
      inventoryService.adjust(productId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements", variables.productId] });
    },
  });
}

export function useVariantStockMovements(variantId: string, params: StockMovementsParams) {
  return useQuery({
    queryKey: queryKeys.inventory.variantMovements(variantId, params),
    queryFn: () => inventoryService.variantMovements(variantId, params),
    enabled: !!variantId,
  });
}

export function useAdjustVariantStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, body }: { variantId: string; body: AdjustStockRequest }) =>
      inventoryService.adjustVariant(variantId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "variantMovements", variables.variantId] });
    },
  });
}
