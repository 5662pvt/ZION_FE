import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promotionsService } from "@/services/promotions.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AddCouponRequest, GenerateCouponsRequest, PromotionListParams, PromotionUpsertRequest } from "@/types/promotions";

export function useAdminPromotions(params: PromotionListParams) {
  return useQuery({
    queryKey: queryKeys.promotions.list(params),
    queryFn: () => promotionsService.list(params),
  });
}

export function useAdminPromotion(id: string) {
  return useQuery({
    queryKey: queryKeys.promotions.detail(id),
    queryFn: () => promotionsService.getById(id),
    enabled: !!id,
  });
}

function useInvalidateAdminPromotions() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["promotions", "list"] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.promotions.detail(id) });
  };
}

export function useCreatePromotion() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: (body: PromotionUpsertRequest) => promotionsService.create(body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdatePromotion() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PromotionUpsertRequest }) => promotionsService.update(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useActivatePromotion() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: (id: string) => promotionsService.activate(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useDeactivatePromotion() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: (id: string) => promotionsService.deactivate(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useAddCoupon() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddCouponRequest }) => promotionsService.addCoupon(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useGenerateCoupons() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GenerateCouponsRequest }) => promotionsService.generateCoupons(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useDeactivateCoupon() {
  const invalidate = useInvalidateAdminPromotions();
  return useMutation({
    mutationFn: ({ id, couponId }: { id: string; couponId: string }) => promotionsService.deactivateCoupon(id, couponId),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}
