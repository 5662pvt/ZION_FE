import { apiGet } from "./apiClient";
import type { ProvinceDto, WardDto } from "@/types/geo";

export const geoService = {
  getProvinces: () => apiGet<ProvinceDto[]>("/api/v1/geo/provinces").then((r) => r.data),

  getWardsByProvince: (provinceId: string) =>
    apiGet<WardDto[]>(`/api/v1/geo/provinces/${provinceId}/wards`).then((r) => r.data),
};
