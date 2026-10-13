import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import { queryKeys } from "@/constants/queryKeys";
import type { ReportDateRangeParams, TopCategoriesParams, TopProductsParams } from "@/types/reports";

export function useReportsDashboard(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(params),
    queryFn: () => reportsService.getDashboard(params),
  });
}

export function useReportsTopProducts(params: TopProductsParams) {
  return useQuery({
    queryKey: queryKeys.reports.topProducts(params),
    queryFn: () => reportsService.getTopProducts(params),
  });
}

export function useReportsTopCategories(params: TopCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.reports.topCategories(params),
    queryFn: () => reportsService.getTopCategories(params),
  });
}

export function useReportsPromotions(params: ReportDateRangeParams) {
  return useQuery({
    queryKey: queryKeys.reports.promotions(params),
    queryFn: () => reportsService.getPromotions(params),
  });
}
