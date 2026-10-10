import type { AdminProductListParams, ProductListParams } from "@/types/products";
import type { MyOrdersParams } from "@/types/orders";
import type { InventoryListParams, StockMovementsParams } from "@/types/inventory";
import type { AdminOrderListParams } from "@/types/adminOrders";
import type { PromotionListParams } from "@/types/promotions";

export const queryKeys = {
  me: ["me"] as const,
  profile: ["profile"] as const,
  addresses: ["addresses"] as const,
  cart: ["cart"] as const,
  categories: {
    tree: ["categories", "tree"] as const,
  },
  products: {
    list: (filters: ProductListParams) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    adminList: (filters: AdminProductListParams) => ["products", "admin", "list", filters] as const,
    adminDetail: (id: string) => ["products", "admin", "detail", id] as const,
  },
  orders: {
    mine: (params: MyOrdersParams) => ["orders", "mine", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  adminOrders: {
    list: (filters: AdminOrderListParams) => ["orders", "admin", "list", filters] as const,
  },
  payments: {
    intent: (id: string) => ["payments", "intent", id] as const,
  },
  inventory: {
    list: (filters: InventoryListParams) => ["inventory", "list", filters] as const,
    movements: (productId: string, params: StockMovementsParams) =>
      ["inventory", "movements", productId, params] as const,
    availability: (productId: string) => ["inventory", "availability", productId] as const,
    availabilityBatch: (productIds: string[]) => ["inventory", "availability", "batch", productIds] as const,
  },
  promotions: {
    list: (filters: PromotionListParams) => ["promotions", "list", filters] as const,
    detail: (id: string) => ["promotions", "detail", id] as const,
  },
};
