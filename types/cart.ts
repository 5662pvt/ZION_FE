export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
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
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
