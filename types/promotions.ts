export type PromotionType = "PercentageOff" | "FixedAmountOff";

export type PromotionStatus = "Active" | "Inactive" | "Scheduled" | "Expired";

export interface CouponDto {
  id: string;
  code: string;
  isActive: boolean;
  usedCount: number;
  createdAt: string;
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
