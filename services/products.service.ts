import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdminProductListParams,
  CreateProductRequest,
  ProductDto,
  ProductImageDto,
  ProductListParams,
  ProductSuggestionDto,
  ProductSummaryDto,
  SetVariantsRequest,
  UpdateProductRequest,
} from "@/types/products";

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

function buildAdminQuery(params: AdminProductListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.status) search.set("status", params.status);

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

  suggest: (q: string, limit = 8) =>
    apiGet<ProductSuggestionDto[]>(`/api/v1/products/suggest?q=${encodeURIComponent(q)}&limit=${limit}`).then(
      (r) => r.data
    ),

  adminGetById: (id: string) => apiGet<ProductDto>(`/api/v1/products/admin/${id}`).then((r) => r.data),

  create: (body: CreateProductRequest) => apiPost<ProductDto>("/api/v1/products", body).then((r) => r.data),

  update: (id: string, body: UpdateProductRequest) =>
    apiPut<ProductDto>(`/api/v1/products/${id}`, body).then((r) => r.data),

  setVariants: (id: string, body: SetVariantsRequest) =>
    apiPut<ProductDto>(`/api/v1/products/${id}/variants`, body).then((r) => r.data),

  archive: (id: string) => apiPost<ProductDto>(`/api/v1/products/${id}/archive`).then((r) => r.data),

  publish: (id: string) => apiPost<ProductDto>(`/api/v1/products/${id}/publish`).then((r) => r.data),

  adminList: async (params: AdminProductListParams = {}): Promise<Paged<ProductSummaryDto>> => {
    const { data, pagination } = await apiGet<ProductSummaryDto[]>(`/api/v1/products/admin${buildAdminQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  uploadImage: (id: string, file: File, alt?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);
    return apiUpload<ProductImageDto>(`/api/v1/products/${id}/images`, formData).then((r) => r.data);
  },

  deleteImage: (id: string, imageId: string) =>
    apiDelete<null>(`/api/v1/products/${id}/images/${imageId}`).then(() => undefined),

  reorderImages: (id: string, imageIds: string[]) =>
    apiPut<null>(`/api/v1/products/${id}/images/order`, { imageIds }).then(() => undefined),
};
