import { useQuery } from "@tanstack/react-query";
import { geoService } from "@/services/geo.service";
import { queryKeys } from "@/constants/queryKeys";

export function useProvinces() {
  return useQuery({
    queryKey: queryKeys.geo.provinces,
    queryFn: geoService.getProvinces,
    staleTime: Infinity,
  });
}

export function useWards(provinceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.geo.wards(provinceId ?? ""),
    queryFn: () => geoService.getWardsByProvince(provinceId!),
    enabled: !!provinceId,
    staleTime: Infinity,
  });
}
