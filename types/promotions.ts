export type PromotionType = "PercentageOff" | "FixedAmountOff" | "FreeShipping" | "Gift";

export type PromotionStatus = "Active" | "Inactive" | "Scheduled" | "Expired";

export type PromotionScope = "Order" | "Products" | "Categories";

export interface CouponDto {
  id: string;
  code: string;
  isActive: boolean;
  usedCount: number;
  createdAt: string;
}

export interface GiftItemDto {
  productId: string;
  quantity: number;
}

export interface PromotionSummaryDto {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  maxDiscountAmount: number | null;
  minOrderSubtotal: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  status: PromotionStatus;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount: number;
  couponCount: number;
  scope: PromotionScope;
  targetProductIds: string[];
  targetCategoryIds: string[];
  minQuantity: number | null;
  giftItems: GiftItemDto[];
}

export interface PromotionDto extends PromotionSummaryDto {
  description: string | null;
  coupons: CouponDto[];
}

export interface PromotionListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: PromotionStatus;
}

export interface PromotionUpsertRequest {
  name: string;
  description?: string | null;
  type: PromotionType;
  value: number;
  maxDiscountAmount?: number | null;
  minOrderSubtotal: number;
  startsAt: string;
  endsAt: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  scope: PromotionScope;
  targetProductIds: string[];
  targetCategoryIds: string[];
  minQuantity: number | null;
  giftItems: GiftItemDto[];
}

export interface AddCouponRequest {
  code: string;
}

export interface GenerateCouponsRequest {
  prefix: string;
  count: number;
}

export interface GenerateCouponsResponse {
  codes: CouponDto[];
}
