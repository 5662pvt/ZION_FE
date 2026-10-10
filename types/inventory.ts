export type StockMovementType = "Reserve" | "Release" | "Commit" | "Return" | "Adjust" | "Expire";

export interface InventoryItemDto {
  productId: string;
  sku: string;
  productName: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface AvailabilityDto {
  productId: string;
  available: number;
  inStock: boolean;
}

export interface AdjustStockRequest {
  delta: number;
  reason: string;
}

export interface InventoryListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  lowStockOnly?: boolean;
}

export interface StockMovementsParams {
  page?: number;
  pageSize?: number;
}
