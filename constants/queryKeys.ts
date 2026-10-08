import type { ProductListParams } from "@/types/products";

export const queryKeys = {
  me: ["me"] as const,
  addresses: ["addresses"] as const,
  cart: ["cart"] as const,
  categories: {
    tree: ["categories", "tree"] as const,
  },
  products: {
    list: (filters: ProductListParams) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
  },
};
