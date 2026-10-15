import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import type { AddCartItemRequest, CartDto } from "@/types/cart";

export function useCartKey() {
  const { user } = useAuth();
  return [...queryKeys.cart, user?.id ?? "guest"] as const;
}

export function useCart() {
  const { isLoading: isAuthLoading } = useAuth();
  const cartKey = useCartKey();
  const query = useQuery({
    queryKey: cartKey,
    queryFn: cartService.get,
    enabled: !isAuthLoading,
  });
  return { ...query, isCartLoading: isAuthLoading || query.isPending };
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  return () => queryClient.invalidateQueries({ queryKey: cartKey });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  return useMutation({
    mutationFn: (body: AddCartItemRequest) => cartService.addItem(body),
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
}

interface CartMutationContext {
  previous: CartDto | undefined;
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  return useMutation<CartDto, Error, { itemId: string; quantity: number }, CartMutationContext>({
    mutationFn: ({ itemId, quantity }) => cartService.updateItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartDto>(cartKey);
      if (previous) {
        const items = previous.items.map((item) =>
          item.id === itemId ? { ...item, quantity, subtotal: item.unitPrice * quantity } : item
        );
        queryClient.setQueryData<CartDto>(cartKey, {
          ...previous,
          items,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous);
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  return useMutation<CartDto, Error, string, CartMutationContext>({
    mutationFn: (itemId) => cartService.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartDto>(cartKey);
      if (previous) {
        const items = previous.items.filter((item) => item.id !== itemId);
        queryClient.setQueryData<CartDto>(cartKey, {
          ...previous,
          items,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous);
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const cartKey = useCartKey();
  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
}
