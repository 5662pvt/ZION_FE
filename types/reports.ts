import type { OrderStatus, PaymentMethod } from "@/types/orders";

export type ReportGranularity = "day" | "month";

export type ReportSortBy = "revenue" | "quantity";

export interface ReportDateRangeParams {
  from?: string;
  to?: string;
}

export interface TopProductsParams extends ReportDateRangeParams {
  limit?: number;
  sortBy?: ReportSortBy;
}

export interface TopCategoriesParams extends ReportDateRangeParams {
  sortBy?: ReportSortBy;
}

export interface KpiValue {
  value: number;
  previous: number;
  changePercent: number | null;
}

export interface RevenueSeriesPoint {
  bucket: string;
  revenue: number;
  orders: number;
}

export interface StatusBreakdownItem {
  status: OrderStatus;
  count: number;
}

export interface PaymentMethodBreakdownItem {
  method: PaymentMethod;
  orders: number;
  revenue: number;
}

export interface DashboardKpis {
  revenue: KpiValue;
  completedOrders: KpiValue;
  averageOrderValue: KpiValue;
  newCustomers: KpiValue;
  placedOrders: KpiValue;
  cancelledOrders: KpiValue;
  discountTotal: KpiValue;
  awaitingShipment: number;
  lowStockProducts: number;
}

export interface DashboardReportDto {
  from: string;
  to: string;
  granularity: ReportGranularity;
  kpis: DashboardKpis;
  revenueSeries: RevenueSeriesPoint[];
  statusBreakdown: StatusBreakdownItem[];
  paymentMethods: PaymentMethodBreakdownItem[];
}

export interface TopProductItemDto {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  orders: number;
}

export interface TopCategoryItemDto {
  categoryId: string | null;
  categoryName: string;
  quantity: number;
  revenue: number;
}

export type ReportPromotionType = "PercentageOff" | "FixedAmountOff" | "FreeShipping" | "Gift" | "Unknown";

export interface PromotionPerformanceItemDto {
  promotionId: string;
  promotionName: string;
  type: ReportPromotionType;
  orders: number;
  discountTotal: number;
  giftQuantity: number;
}
