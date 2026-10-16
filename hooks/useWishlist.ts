"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/services/wishlist.service";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import type { WishlistParams } from "@/types/users";

export function useWishlistIds() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlist.ids,
    queryFn: wishlistService.getIds,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useWishlist(params: WishlistParams = {}) {
  return useQuery({
    queryKey: queryKeys.wishlist.list(params),
    queryFn: () => wishlistService.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onMutate: async (productId: string) => {
      const previous = queryClient.getQueryData<string[]>(queryKeys.wishlist.ids);
      queryClient.setQueryData<string[]>(queryKeys.wishlist.ids, (ids) =>
        ids?.includes(productId) ? ids : [...(ids ?? []), productId]
      );
      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.wishlist.ids, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.ids });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "list"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.remove(productId),
    onMutate: async (productId: string) => {
      const previous = queryClient.getQueryData<string[]>(queryKeys.wishlist.ids);
      queryClient.setQueryData<string[]>(queryKeys.wishlist.ids, (ids) => ids?.filter((id) => id !== productId) ?? []);
      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.wishlist.ids, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.ids });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "list"] });
    },
  });
}
