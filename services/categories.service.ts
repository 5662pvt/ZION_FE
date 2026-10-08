import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import type { CategoryDto, CategoryTreeNodeDto, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/categories";

export const categoriesService = {
  getTree: () => apiGet<CategoryTreeNodeDto[]>("/api/v1/categories?tree=true").then((r) => r.data),

  getFlat: () => apiGet<CategoryDto[]>("/api/v1/categories?tree=false").then((r) => r.data),

  create: (body: CreateCategoryRequest) => apiPost<CategoryDto>("/api/v1/categories", body).then((r) => r.data),

  update: (id: string, body: UpdateCategoryRequest) =>
    apiPut<CategoryDto>(`/api/v1/categories/${id}`, body).then((r) => r.data),

  remove: (id: string) => apiDelete<null>(`/api/v1/categories/${id}`).then(() => undefined),
};
