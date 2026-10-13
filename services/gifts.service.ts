import { apiGet } from "./apiClient";
import type { GiftPreviewDto } from "@/types/gifts";

export const giftsService = {
  preview: () => apiGet<GiftPreviewDto[]>("/api/v1/promotions/gifts/preview").then((r) => r.data),
};
