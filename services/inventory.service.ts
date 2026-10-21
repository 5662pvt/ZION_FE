import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdjustStockRequest,
  AvailabilityDto,
  InventoryItemDto,
  InventoryListParams,
  ProductAvailabilityDto,
  StockMovementDto,
  StockMovementsParams,
} from "@/types/inventory";

function buildListQuery(params: InventoryListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.lowStockOnly) search.set("lowStockOnly", String(params.lowStockOnly));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildMovementsQuery(params: StockMovementsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const inventoryService = {
  search: async (params: InventoryListParams = {}): Promise<Paged<InventoryItemDto>> => {
    const { data, pagination } = await apiGet<InventoryItemDto[]>(`/api/v1/inventory${buildListQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  movements: async (productId: string, params: StockMovementsParams = {}): Promise<Paged<StockMovementDto>> => {
    const { data, pagination } = await apiGet<StockMovementDto[]>(
      `/api/v1/inventory/products/${productId}/movements${buildMovementsQuery(params)}`,
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  adjust: (productId: string, body: AdjustStockRequest) =>
    apiPost<InventoryItemDto>(`/api/v1/inventory/products/${productId}/adjust`, body).then((r) => r.data),

  getAvailability: (productId: string) =>
    apiGet<AvailabilityDto>(`/api/v1/inventory/products/${productId}`).then((r) => r.data),

  getAvailabilityBatch: (productIds: string[]) =>
    apiGet<AvailabilityDto[]>(`/api/v1/inventory/availability?productIds=${encodeURIComponent(productIds.join(","))}`).then(
      (r) => r.data,
    ),

  getVariantAvailability: (variantId: string) =>
    apiGet<AvailabilityDto>(`/api/v1/inventory/variants/${variantId}`).then((r) => r.data),

  getAvailabilityByVariants: (variantIds: string[]) =>
    apiGet<AvailabilityDto[]>(
      `/api/v1/inventory/availability/variants?variantIds=${encodeURIComponent(variantIds.join(","))}`,
    ).then((r) => r.data),

  getAvailabilityByProducts: (productIds: string[]) =>
    apiGet<ProductAvailabilityDto[]>(
      `/api/v1/inventory/availability/products?productIds=${encodeURIComponent(productIds.join(","))}`,
    ).then((r) => r.data),

  variantMovements: async (variantId: string, params: StockMovementsParams = {}): Promise<Paged<StockMovementDto>> => {
    const { data, pagination } = await apiGet<StockMovementDto[]>(
      `/api/v1/inventory/variants/${variantId}/movements${buildMovementsQuery(params)}`,
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  adjustVariant: (variantId: string, body: AdjustStockRequest) =>
    apiPost<InventoryItemDto>(`/api/v1/inventory/variants/${variantId}/adjust`, body).then((r) => r.data),
};
