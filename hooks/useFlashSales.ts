import { useQuery } from "@tanstack/react-query";
import { flashSalesService } from "@/services/flashSales.service";
import { queryKeys } from "@/constants/queryKeys";

export function useActiveFlashSales() {
  return useQuery({
    queryKey: queryKeys.flashSales.active,
    queryFn: () => flashSalesService.getActive(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useActiveFlashSaleForProduct(productId: string) {
  const { data, isLoading } = useActiveFlashSales();
  const item = (data ?? [])
    .flatMap((flashSale) => flashSale.items.map((i) => ({ ...i, flashSaleEndsAt: flashSale.endsAt })))
    .find((i) => i.productId === productId && i.available > 0);
  return { item, isLoading };
}
