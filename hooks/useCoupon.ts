"use client";

import { useMutation } from "@tanstack/react-query";
import { couponsService, type ValidateCouponRequest } from "@/services/coupons.service";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (body: ValidateCouponRequest) => couponsService.validate(body),
  });
}
