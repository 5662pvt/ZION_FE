export interface ActiveFlashSaleItemDto {
  productId: string;
  variantId: string;
  variantLabel: string | null;
  sku: string | null;
  productName: string;
  imageUrl: string | null;
  flashPrice: number;
  regularPrice: number;
  available: number;
  allocatedQuantity: number;
  endsAt: string;
}

export interface ActiveFlashSaleDto {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  items: ActiveFlashSaleItemDto[];
}

export interface FlashSaleItemDto {
  id: string;
  productId: string;
  variantId: string;
  variantLabel: string | null;
  sku: string | null;
  flashPrice: number;
  allocatedQuantity: number;
  soldQuantity: number;
  available: number;
}

export interface FlashSaleSummaryDto {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  itemCount: number;
}

export interface FlashSaleDto {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  items: FlashSaleItemDto[];
}

export interface FlashSaleListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface FlashSaleUpsertRequest {
  name: string;
  startsAt: string;
  endsAt: string;
}

export interface AddFlashSaleItemRequest {
  productId?: string;
  variantId?: string;
  flashPrice: number;
  allocatedQuantity: number;
}
