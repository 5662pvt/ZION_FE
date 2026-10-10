import { apiGet, apiPost, apiPut } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AddCouponRequest,
  CouponDto,
  GenerateCouponsRequest,
  GenerateCouponsResponse,
  PromotionDto,
  PromotionListParams,
  PromotionSummaryDto,
  PromotionUpsertRequest,
} from "@/types/promotions";

function buildQuery(params: PromotionListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.status) search.set("status", params.status);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const promotionsService = {
  list: async (params: PromotionListParams = {}): Promise<Paged<PromotionSummaryDto>> => {
    const { data, pagination } = await apiGet<PromotionSummaryDto[]>(`/api/v1/promotions${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: (id: string) => apiGet<PromotionDto>(`/api/v1/promotions/${id}`).then((r) => r.data),

  create: (body: PromotionUpsertRequest) => apiPost<PromotionDto>("/api/v1/promotions", body).then((r) => r.data),

  update: (id: string, body: PromotionUpsertRequest) =>
    apiPut<PromotionDto>(`/api/v1/promotions/${id}`, body).then((r) => r.data),

  activate: (id: string) => apiPost<PromotionDto>(`/api/v1/promotions/${id}/activate`).then((r) => r.data),

  deactivate: (id: string) => apiPost<PromotionDto>(`/api/v1/promotions/${id}/deactivate`).then((r) => r.data),

  addCoupon: (id: string, body: AddCouponRequest) =>
    apiPost<CouponDto>(`/api/v1/promotions/${id}/coupons`, body).then((r) => r.data),

  generateCoupons: (id: string, body: GenerateCouponsRequest) =>
    apiPost<GenerateCouponsResponse>(`/api/v1/promotions/${id}/coupons/generate`, body).then((r) => r.data),

  deactivateCoupon: (id: string, couponId: string) =>
    apiPost<CouponDto>(`/api/v1/promotions/${id}/coupons/${couponId}/deactivate`).then((r) => r.data),
};
