import { apiPost } from "./apiClient";

export interface ValidateCouponRequest {
  code: string;
}

export interface ValidateCouponResultDto {
  code: string;
  promotionName: string;
  discountAmount: number;
  discountTarget: "Items" | "Shipping";
}

export const couponsService = {
  validate: (body: ValidateCouponRequest) =>
    apiPost<ValidateCouponResultDto>("/api/v1/promotions/coupons/validate", body).then((r) => r.data),
};
