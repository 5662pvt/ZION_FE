import type { AdminProductListParams, ProductListParams } from "@/types/products";
import type { MyOrdersParams } from "@/types/orders";

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
  payments: {
    intent: (id: string) => ["payments", "intent", id] as const,
  },
};
