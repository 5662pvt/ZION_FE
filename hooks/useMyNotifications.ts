"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { queryKeys } from "@/constants/queryKeys";
import type { MyNotificationsParams } from "@/types/notifications";

export function useMyNotifications(params: MyNotificationsParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.mine(params),
    queryFn: () => notificationsService.getMine(params),
    placeholderData: (previousData) => previousData,
  });
}
