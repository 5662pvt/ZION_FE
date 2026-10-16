import { apiGet } from "./apiClient";
import type { Paged } from "@/types/api";
import type { MyNotificationsParams, NotificationDto } from "@/types/notifications";

function buildQuery(params: MyNotificationsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const notificationsService = {
  getMine: async (params: MyNotificationsParams = {}): Promise<Paged<NotificationDto>> => {
    const { data, pagination } = await apiGet<NotificationDto[]>(`/api/v1/notifications/mine${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },
};
