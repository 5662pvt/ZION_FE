"use client";

import { useEffect, useRef } from "react";
import { HubConnectionBuilder, HubConnectionState, type HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, onAuthCleared } from "@/utils/authStorage";
import { toast } from "@/utils/toast";
import { queryKeys } from "@/constants/queryKeys";
import type { UserNotificationDto } from "@/types/notifications";

const HUB_PATH = "/hubs/notifications";

export function useNotificationSocket() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL ?? ""}${HUB_PATH}`, {
        accessTokenFactory: () => getAccessToken() ?? "",
        // Auth is via accessTokenFactory (bearer token), no cookies needed; default true sends
        // credentials:"include", which the API's CORS policy rejects (no Allow-Credentials header).
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("notificationReceived", (payload: UserNotificationDto) => {
      toast.info(payload.title);
      queryClient.invalidateQueries({ queryKey: ["notifications", "feed"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    });

    connection.onreconnected(() => console.warn("Notification socket reconnected"));
    connection.onclose((error) => console.warn("Notification socket closed", error));

    connection.start().catch((error) => console.warn("Notification socket failed to connect", error));

    connectionRef.current = connection;

    const unsubscribe = onAuthCleared(() => {
      void connectionRef.current?.stop();
      connectionRef.current = null;
    });

    return () => {
      unsubscribe();
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        void connectionRef.current.stop();
      }
      connectionRef.current = null;
    };
  }, [isAuthenticated, queryClient]);
}
