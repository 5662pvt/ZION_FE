import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import type { AddCartItemRequest, CartDto, UpdateCartItemRequest } from "@/types/cart";

export const cartService = {
  get: () => apiGet<CartDto>("/api/v1/cart").then((r) => r.data),

  addItem: (body: AddCartItemRequest) => apiPost<CartDto>("/api/v1/cart/items", body).then((r) => r.data),

  updateItem: (itemId: string, body: UpdateCartItemRequest) =>
    apiPut<CartDto>(`/api/v1/cart/items/${itemId}`, body).then((r) => r.data),

  removeItem: (itemId: string) => apiDelete<CartDto>(`/api/v1/cart/items/${itemId}`).then((r) => r.data),

  clear: () => apiDelete<CartDto>("/api/v1/cart").then((r) => r.data),

  mergeGuestCart: () => apiPost<CartDto>("/api/v1/cart/merge").then((r) => r.data),
};
