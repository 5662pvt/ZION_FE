import { apiDelete, apiGet, apiPut } from "./apiClient";
import type { Paged } from "@/types/api";
import type { WishlistItemDto, WishlistParams, WishlistToggleResponse } from "@/types/users";

function buildQuery(params: WishlistParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const wishlistService = {
  list: async (params: WishlistParams = {}): Promise<Paged<WishlistItemDto>> => {
    const { data, pagination } = await apiGet<WishlistItemDto[]>(`/api/v1/users/me/wishlist${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getIds: () => apiGet<string[]>("/api/v1/users/me/wishlist/ids").then((r) => r.data),

  add: (productId: string) =>
    apiPut<WishlistToggleResponse>(`/api/v1/users/me/wishlist/${productId}`).then((r) => r.data),

  remove: (productId: string) =>
    apiDelete<WishlistToggleResponse>(`/api/v1/users/me/wishlist/${productId}`).then((r) => r.data),
};
