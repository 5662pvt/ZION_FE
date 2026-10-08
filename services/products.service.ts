import { apiGet, apiPost, apiPut } from "./apiClient";
import type { Paged } from "@/types/api";
import type { CreateProductRequest, ProductDto, ProductListParams, ProductSummaryDto, UpdateProductRequest } from "@/types/products";

function buildQuery(params: ProductListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const productsService = {
  list: async (params: ProductListParams = {}): Promise<Paged<ProductSummaryDto>> => {
    const { data, pagination } = await apiGet<ProductSummaryDto[]>(`/api/v1/products${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: (id: string) => apiGet<ProductDto>(`/api/v1/products/${id}`).then((r) => r.data),

  getBySlug: (slug: string) => apiGet<ProductDto>(`/api/v1/products/by-slug/${slug}`).then((r) => r.data),

  create: (body: CreateProductRequest) => apiPost<ProductDto>("/api/v1/products", body).then((r) => r.data),

  update: (id: string, body: UpdateProductRequest) =>
    apiPut<ProductDto>(`/api/v1/products/${id}`, body).then((r) => r.data),

  archive: (id: string) => apiPost<ProductDto>(`/api/v1/products/${id}/archive`).then((r) => r.data),

  publish: (id: string) => apiPost<ProductDto>(`/api/v1/products/${id}/publish`).then((r) => r.data),
};
