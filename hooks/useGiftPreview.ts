import { useQuery } from "@tanstack/react-query";
import { giftsService } from "@/services/gifts.service";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

function cartSignature(items: { productId: string; quantity: number }[] | undefined): string {
  return (items ?? []).map((item) => `${item.productId}:${item.quantity}`).join(",");
}

export function useGiftPreview() {
  const { isAuthenticated } = useAuth();
  const { data: cart } = useCart();
  const signature = cartSignature(cart?.items);

  return useQuery({
    queryKey: queryKeys.gifts.preview(signature),
    queryFn: giftsService.preview,
    enabled: isAuthenticated && (cart?.items.length ?? 0) > 0,
  });
}
