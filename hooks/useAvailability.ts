import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AvailabilityDto, ProductAvailabilityDto } from "@/types/inventory";

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

export function useVariantAvailability(variantIds: string[]) {
  const sortedIds = [...variantIds].sort();
  return useQuery({
    queryKey: queryKeys.inventory.variantAvailabilityBatch(sortedIds),
    queryFn: async () => {
      const items = await inventoryService.getAvailabilityByVariants(sortedIds);
      return items.reduce<Record<string, AvailabilityDto>>((acc, item) => {
        acc[item.variantId] = item;
        return acc;
      }, {});
    },
    enabled: sortedIds.length > 0,
    staleTime: 15_000,
  });
}

export function useProductAvailabilitySummary(productIds: string[]) {
  const sortedIds = [...productIds].sort();
  return useQuery({
    queryKey: queryKeys.inventory.productAvailabilitySummary(sortedIds),
    queryFn: async () => {
      const items = await inventoryService.getAvailabilityByProducts(sortedIds);
      return items.reduce<Record<string, ProductAvailabilityDto>>((acc, item) => {
        acc[item.productId] = item;
        return acc;
      }, {});
    },
    enabled: sortedIds.length > 0,
    staleTime: 15_000,
  });
}
