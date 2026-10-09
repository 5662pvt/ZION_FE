import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import { queryKeys } from "@/constants/queryKeys";
import type { ProductListParams } from "@/types/products";

export function useProducts(filters: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => productsService.getBySlug(slug),
    enabled: !!slug,
  });
}
