import { apiGet, apiPost, apiPut } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  ActiveFlashSaleDto,
  AddFlashSaleItemRequest,
  FlashSaleDto,
  FlashSaleItemDto,
  FlashSaleListParams,
  FlashSaleSummaryDto,
  FlashSaleUpsertRequest,
} from "@/types/flashSales";

function buildQuery(params: FlashSaleListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.keyword) search.set("keyword", params.keyword);

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const flashSalesService = {
  getActive: () => apiGet<ActiveFlashSaleDto[]>("/api/v1/flash-sales/active").then((r) => r.data),

  list: async (params: FlashSaleListParams = {}): Promise<Paged<FlashSaleSummaryDto>> => {
    const { data, pagination } = await apiGet<FlashSaleSummaryDto[]>(`/api/v1/admin/flash-sales${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getById: (id: string) => apiGet<FlashSaleDto>(`/api/v1/admin/flash-sales/${id}`).then((r) => r.data),

  create: (body: FlashSaleUpsertRequest) => apiPost<FlashSaleDto>("/api/v1/admin/flash-sales", body).then((r) => r.data),

  update: (id: string, body: FlashSaleUpsertRequest) =>
    apiPut<FlashSaleDto>(`/api/v1/admin/flash-sales/${id}`, body).then((r) => r.data),

  activate: (id: string) => apiPost<FlashSaleDto>(`/api/v1/admin/flash-sales/${id}/activate`).then((r) => r.data),

  deactivate: (id: string) => apiPost<FlashSaleDto>(`/api/v1/admin/flash-sales/${id}/deactivate`).then((r) => r.data),

  addItem: (flashSaleId: string, body: AddFlashSaleItemRequest) =>
    apiPost<FlashSaleItemDto>(`/api/v1/admin/flash-sales/${flashSaleId}/items`, body).then((r) => r.data),
};
