import type { AdminProductListParams, ProductListParams } from "@/types/products";
import type { MyOrdersParams } from "@/types/orders";
import type { InventoryListParams, StockMovementsParams } from "@/types/inventory";
import type { AdminOrderListParams } from "@/types/adminOrders";
import type { PromotionListParams } from "@/types/promotions";
import type { FlashSaleListParams } from "@/types/flashSales";
import type { AdminReviewListParams, MyReviewsParams, ReviewListParams } from "@/types/reviews";
import type { ProductQuestionListParams } from "@/types/questions";
import type { ReportDateRangeParams, TopCategoriesParams, TopProductsParams } from "@/types/reports";
import type { InboxListParams, OutboxListParams } from "@/types/system";
import type { AdminCustomerListParams } from "@/types/adminCustomers";
import type { AdminPaymentListParams } from "@/types/adminPayments";
import type { AuditLogListParams } from "@/types/auditLogs";
import type { WishlistParams } from "@/types/users";
import type { MyNotificationsParams, NotificationFeedParams } from "@/types/notifications";
import type { AdminRefundListParams, AdminReturnListParams } from "@/types/returns";

export const queryKeys = {
  me: ["me"] as const,
  profile: ["profile"] as const,
  addresses: ["addresses"] as const,
  cart: ["cart"] as const,
  categories: {
    tree: ["categories", "tree"] as const,
  },
  geo: {
    provinces: ["geo", "provinces"] as const,
    wards: (provinceId: string) => ["geo", "wards", provinceId] as const,
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
  returns: {
    adminList: (filters: AdminReturnListParams) => ["returns", "admin", "list", filters] as const,
    adminDetail: (id: string) => ["returns", "admin", "detail", id] as const,
  },
  refunds: {
    adminList: (filters: AdminRefundListParams) => ["refunds", "admin", "list", filters] as const,
  },
  payments: {
    intent: (id: string) => ["payments", "intent", id] as const,
  },
  inventory: {
    list: (filters: InventoryListParams) => ["inventory", "list", filters] as const,
    movements: (productId: string, params: StockMovementsParams) =>
      ["inventory", "movements", productId, params] as const,
    variantMovements: (variantId: string, params: StockMovementsParams) =>
      ["inventory", "variantMovements", variantId, params] as const,
    availability: (productId: string) => ["inventory", "availability", productId] as const,
    availabilityBatch: (productIds: string[]) => ["inventory", "availability", "batch", productIds] as const,
    variantAvailabilityBatch: (variantIds: string[]) =>
      ["inventory", "availability", "variants", "batch", variantIds] as const,
    productAvailabilitySummary: (productIds: string[]) =>
      ["inventory", "availability", "products", "batch", productIds] as const,
  },
  promotions: {
    list: (filters: PromotionListParams) => ["promotions", "list", filters] as const,
    detail: (id: string) => ["promotions", "detail", id] as const,
  },
  gifts: {
    preview: (signature: string) => ["gifts", "preview", signature] as const,
  },
  flashSales: {
    active: ["flashSales", "active"] as const,
    list: (filters: FlashSaleListParams) => ["flashSales", "admin", "list", filters] as const,
    detail: (id: string) => ["flashSales", "admin", "detail", id] as const,
  },
  reviews: {
    list: (productId: string, filters: ReviewListParams) => ["reviews", "list", productId, filters] as const,
    summary: (productId: string) => ["reviews", "summary", productId] as const,
    summaries: (productIds: string[]) => ["reviews", "summaries", productIds] as const,
    eligibility: (productId: string) => ["reviews", "eligibility", productId] as const,
    adminList: (filters: AdminReviewListParams) => ["reviews", "admin", "list", filters] as const,
    mine: (params: MyReviewsParams) => ["reviews", "mine", params] as const,
  },
  productQuestions: {
    list: (productId: string, filters: ProductQuestionListParams) =>
      ["productQuestions", "list", productId, filters] as const,
  },
  wishlist: {
    ids: ["wishlist", "ids"] as const,
    list: (params: WishlistParams) => ["wishlist", "list", params] as const,
  },
  notifications: {
    mine: (params: MyNotificationsParams) => ["notifications", "mine", params] as const,
    feed: (params: NotificationFeedParams) => ["notifications", "feed", params] as const,
    unreadCount: () => ["notifications", "unreadCount"] as const,
  },
  reports: {
    dashboard: (params: ReportDateRangeParams) => ["reports", "dashboard", params] as const,
    topProducts: (params: TopProductsParams) => ["reports", "topProducts", params] as const,
    topCategories: (params: TopCategoriesParams) => ["reports", "topCategories", params] as const,
    promotions: (params: ReportDateRangeParams) => ["reports", "promotions", params] as const,
  },
  system: {
    modules: ["system", "modules"] as const,
    health: ["system", "health"] as const,
    outboxList: (filters: OutboxListParams) => ["system", "outbox", "list", filters] as const,
    outboxDetail: (module: string, id: string) => ["system", "outbox", "detail", module, id] as const,
    inboxList: (filters: InboxListParams) => ["system", "inbox", "list", filters] as const,
    dlq: (limit: number) => ["system", "dlq", limit] as const,
  },
  adminCustomers: {
    list: (filters: AdminCustomerListParams) => ["customers", "admin", "list", filters] as const,
    detail: (id: string) => ["customers", "admin", "detail", id] as const,
  },
  adminPayments: {
    list: (filters: AdminPaymentListParams) => ["payments", "admin", "list", filters] as const,
  },
  auditLogs: {
    list: (filters: AuditLogListParams) => ["audit-logs", "list", filters] as const,
  },
};
