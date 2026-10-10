import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AvailabilityDto } from "@/types/inventory";

export function useProductAvailability(productId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.availability(productId),
    queryFn: () => inventoryService.getAvailability(productId),
    enabled: !!productId,
    staleTime: 15_000,
  });
}

export function useAvailabilityBatch(productIds: string[]) {
  const sortedIds = [...productIds].sort();
  return useQuery({
    queryKey: queryKeys.inventory.availabilityBatch(sortedIds),
    queryFn: async () => {
      const items = await inventoryService.getAvailabilityBatch(sortedIds);
      return items.reduce<Record<string, AvailabilityDto>>((acc, item) => {
        acc[item.productId] = item;
        return acc;
      }, {});
    },
    enabled: sortedIds.length > 0,
    staleTime: 15_000,
  });
}
