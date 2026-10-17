"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { queryKeys } from "@/constants/queryKeys";
import { useAuth } from "@/hooks/useAuth";

export function useUnreadNotificationCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsService.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
