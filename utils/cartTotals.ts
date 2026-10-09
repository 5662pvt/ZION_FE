import type { CartDto, CartItemDto } from "@/types/cart";

export function lineTotal(item: CartItemDto): number {
  return item.subtotal;
}

export function cartSubtotal(cart: CartDto | null | undefined): number {
  return cart?.subtotal ?? 0;
}

export function cartItemCount(cart: CartDto | null | undefined): number {
  return cart?.totalQuantity ?? 0;
}
