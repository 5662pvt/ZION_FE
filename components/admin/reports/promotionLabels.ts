import type { ReportPromotionType } from "@/types/reports";

export const PROMOTION_TYPE_LABEL: Record<ReportPromotionType, string> = {
  PercentageOff: "Giảm theo %",
  FixedAmountOff: "Giảm số tiền",
  FreeShipping: "Miễn phí vận chuyển",
  Gift: "Tặng quà",
  Unknown: "Không xác định",
};
