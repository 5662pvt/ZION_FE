import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdminReviewDto,
  AdminReviewListParams,
  CreateReviewRequest,
  HideReviewRequest,
  ReviewBatchSummaryDto,
  ReviewDto,
  ReviewEligibilityDto,
  ReviewListParams,
  ReviewSummaryDto,
  UpdateReviewRequest,
} from "@/types/reviews";

function buildQuery(params: ReviewListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.rating !== undefined) search.set("rating", String(params.rating));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildAdminQuery(params: AdminReviewListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.rating !== undefined) search.set("rating", String(params.rating));
  if (params.keyword) search.set("keyword", params.keyword);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const reviewsService = {
  list: async (productId: string, params: ReviewListParams = {}): Promise<Paged<ReviewDto>> => {
    const { data, pagination } = await apiGet<ReviewDto[]>(
      `/api/v1/products/${productId}/reviews${buildQuery(params)}`,
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getSummary: (productId: string) =>
    apiGet<ReviewSummaryDto>(`/api/v1/products/${productId}/reviews/summary`).then((r) => r.data),

  getSummaries: (productIds: string[]) =>
    apiGet<ReviewBatchSummaryDto[]>(
      `/api/v1/reviews/summaries?productIds=${encodeURIComponent(productIds.join(","))}`,
    ).then((r) => r.data),

  getEligibility: (productId: string) =>
    apiGet<ReviewEligibilityDto>(`/api/v1/products/${productId}/reviews/eligibility`).then((r) => r.data),

  create: (productId: string, body: CreateReviewRequest) =>
    apiPost<ReviewDto>(`/api/v1/products/${productId}/reviews`, body).then((r) => r.data),

  update: (id: string, body: UpdateReviewRequest) =>
    apiPut<ReviewDto>(`/api/v1/reviews/${id}`, body).then((r) => r.data),

  delete: (id: string) => apiDelete<null>(`/api/v1/reviews/${id}`).then(() => undefined),
};

export const adminReviewsService = {
  list: async (params: AdminReviewListParams = {}): Promise<Paged<AdminReviewDto>> => {
    const { data, pagination } = await apiGet<AdminReviewDto[]>(`/api/v1/admin/reviews${buildAdminQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  hide: (id: string, body: HideReviewRequest = {}) =>
    apiPost<AdminReviewDto>(`/api/v1/admin/reviews/${id}/hide`, body).then((r) => r.data),

  show: (id: string) => apiPost<AdminReviewDto>(`/api/v1/admin/reviews/${id}/show`).then((r) => r.data),
};
