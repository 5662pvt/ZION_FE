export interface CartItemDto {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string | null;
  sku: string | null;
  productSlug: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  currency: string;
}

export interface CartDto {
  id: string;
  userId: string | null;
  anonymousId: string | null;
  subtotal: number;
  currency: string;
  totalQuantity: number;
  items: CartItemDto[];
}

export interface AddCartItemRequest {
  productId?: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
