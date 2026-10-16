import { apiDownload, apiGet } from "./apiClient";
import type {
  DashboardReportDto,
  PromotionPerformanceItemDto,
  ReportDateRangeParams,
  TopCategoriesParams,
  TopCategoryItemDto,
  TopProductItemDto,
  TopProductsParams,
} from "@/types/reports";

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildExportFilename(prefix: string, params: ReportDateRangeParams): string {
  const from = params.from?.replace(/-/g, "");
  const to = params.to?.replace(/-/g, "");
  const suffix = from && to ? `_${from}_${to}` : "";
  return `${prefix}${suffix}.csv`;
}

async function downloadCsv(path: string, params: ReportDateRangeParams, filename: string): Promise<void> {
  const blob = await apiDownload(path, params as Record<string, string | number | undefined>);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const reportsService = {
  getDashboard: (params: ReportDateRangeParams = {}) =>
    apiGet<DashboardReportDto>(`/api/v1/admin/reports/dashboard${buildQuery(params)}`).then((r) => r.data),

  getTopProducts: (params: TopProductsParams = {}) =>
    apiGet<TopProductItemDto[]>(`/api/v1/admin/reports/top-products${buildQuery(params)}`).then((r) => r.data),

  getTopCategories: (params: TopCategoriesParams = {}) =>
    apiGet<TopCategoryItemDto[]>(`/api/v1/admin/reports/top-categories${buildQuery(params)}`).then((r) => r.data),

  getPromotions: (params: ReportDateRangeParams = {}) =>
    apiGet<PromotionPerformanceItemDto[]>(`/api/v1/admin/reports/promotions${buildQuery(params)}`).then((r) => r.data),

  exportRevenueCsv: (params: ReportDateRangeParams = {}) =>
    downloadCsv("/api/v1/admin/reports/export/revenue.csv", params, buildExportFilename("doanh-thu", params)),

  exportTopProductsCsv: (params: ReportDateRangeParams = {}) =>
    downloadCsv("/api/v1/admin/reports/export/top-products.csv", params, buildExportFilename("san-pham-ban-chay", params)),

  exportPromotionsCsv: (params: ReportDateRangeParams = {}) =>
    downloadCsv("/api/v1/admin/reports/export/promotions.csv", params, buildExportFilename("khuyen-mai", params)),
};
