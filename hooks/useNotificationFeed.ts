"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { queryKeys } from "@/constants/queryKeys";
import type { NotificationFeedParams } from "@/types/notifications";

export function useNotificationFeed(params: NotificationFeedParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.feed(params),
    queryFn: () => notificationsService.getFeed(params),
    placeholderData: (previousData) => previousData,
  });
}
