import { apiPost } from "./apiClient";

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResultDto {
  code: string;
  promotionName: string;
  discountAmount: number;
}

export const couponsService = {
  validate: (body: ValidateCouponRequest) =>
    apiPost<ValidateCouponResultDto>("/api/v1/promotions/coupons/validate", body).then((r) => r.data),
};
