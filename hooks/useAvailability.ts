import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AvailabilityDto, ProductAvailabilityDto } from "@/types/inventory";

const AVAILABILITY_BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

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
      const batches = await Promise.all(
        chunk(sortedIds, AVAILABILITY_BATCH_SIZE).map((batch) => inventoryService.getAvailabilityByVariants(batch)),
      );
      return batches.flat().reduce<Record<string, AvailabilityDto>>((acc, item) => {
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
      const batches = await Promise.all(
        chunk(sortedIds, AVAILABILITY_BATCH_SIZE).map((batch) => inventoryService.getAvailabilityByProducts(batch)),
      );
      return batches.flat().reduce<Record<string, ProductAvailabilityDto>>((acc, item) => {
        acc[item.productId] = item;
        return acc;
      }, {});
    },
    enabled: sortedIds.length > 0,
    staleTime: 15_000,
  });
}
