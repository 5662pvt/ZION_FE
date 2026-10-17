import { apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type { MyNotificationsParams, NotificationDto, NotificationFeedParams, UserNotificationDto } from "@/types/notifications";

function buildQuery(params: MyNotificationsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildFeedQuery(params: NotificationFeedParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.unreadOnly) search.set("unreadOnly", String(params.unreadOnly));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const notificationsService = {
  getMine: async (params: MyNotificationsParams = {}): Promise<Paged<NotificationDto>> => {
    const { data, pagination } = await apiGet<NotificationDto[]>(`/api/v1/notifications/mine${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getFeed: async (params: NotificationFeedParams = {}): Promise<Paged<UserNotificationDto>> => {
    const { data, pagination } = await apiGet<UserNotificationDto[]>(
      `/api/v1/notifications/feed${buildFeedQuery(params)}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiGet<{ count: number }>("/api/v1/notifications/feed/unread-count");
    return data.count;
  },

  markRead: async (id: string): Promise<void> => {
    await apiPost<void>(`/api/v1/notifications/feed/${id}/read`);
  },

  markAllRead: async (): Promise<number> => {
    const { data } = await apiPost<{ count: number }>("/api/v1/notifications/feed/read-all");
    return data.count;
  },
};
