"use client";

import { useEffect, type ReactNode } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from "@microsoft/signalr";
import { getAccessToken, onAuthCleared } from "@/utils/authStorage";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessageEventPayload, ChatReadEventPayload, ChatTypingEventPayload } from "@/types/chat";

const HUB_PATH = "/hubs/chat";

interface ChatEventMap {
  "chat:message": ChatMessageEventPayload;
  "chat:read": ChatReadEventPayload;
  "chat:typing": ChatTypingEventPayload;
}

type ChatEvent = keyof ChatEventMap;

const CHAT_EVENTS: ChatEvent[] = ["chat:message", "chat:read", "chat:typing"];

// Module-level singleton: one SignalR connection shared by every mounted ChatSocketProvider
// (customer shop layout now, admin layout later). Ref-counted so navigating between the shop
// and admin areas tears down and recreates the connection instead of leaking sockets.
//
// refCount briefly touches 0 when navigating straight from one area's layout to the other's
// (the old layout unmounts before the new one mounts), which would otherwise stop the socket
// mid-negotiation. A short grace period lets acquireConnection cancel the pending stop and
// reuse the still-live connection instead.
let connection: HubConnection | null = null;
let connectionOwnerId: string | null = null;
let refCount = 0;
let unauthUnsubscribe: (() => void) | null = null;
let pendingRelease: ReturnType<typeof setTimeout> | null = null;
const RELEASE_GRACE_MS = 1500;
const intentionallyStopped = new WeakSet<HubConnection>();

const listeners: { [K in ChatEvent]: Set<(payload: ChatEventMap[K]) => void> } = {
  "chat:message": new Set(),
  "chat:read": new Set(),
  "chat:typing": new Set(),
};

function buildConnection(): HubConnection {
  const conn = new HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_API_URL ?? ""}${HUB_PATH}`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  function bind<K extends ChatEvent>(event: K): void {
    conn.on(event, (payload: ChatEventMap[K]) => {
      listeners[event].forEach((handler) => handler(payload));
    });
  }
  CHAT_EVENTS.forEach(bind);

  conn.onclose((error) => {
    if (intentionallyStopped.has(conn)) return;
    console.warn("Chat socket closed", error);
  });

  return conn;
}

function cancelPendingRelease(): void {
  if (pendingRelease) {
    clearTimeout(pendingRelease);
    pendingRelease = null;
  }
}

/** Stops the connection right away. Used for logout, where the socket must not linger. */
function releaseAll(): void {
  cancelPendingRelease();
  refCount = 0;
  connectionOwnerId = null;
  const current = connection;
  connection = null;
  if (current && current.state !== HubConnectionState.Disconnected) {
    intentionallyStopped.add(current);
    void current.stop();
  }
}

/** Acquires the shared connection for `userId`. If a live connection belongs to a different
 * user (switched account without a logout, or re-acquired by a new user within the release
 * grace period), it is stopped immediately and rebuilt for the new owner. */
function acquireConnection(userId: string): void {
  if (connection && connectionOwnerId !== null && connectionOwnerId !== userId) {
    releaseAll();
  }

  refCount += 1;
  cancelPendingRelease();
  connectionOwnerId = userId;
  if (connection) return;

  const conn = buildConnection();
  connection = conn;
  conn.start().catch((error) => {
    if (intentionallyStopped.has(conn)) return;
    console.warn("Chat socket failed to connect", error);
  });

  if (!unauthUnsubscribe) {
    unauthUnsubscribe = onAuthCleared(releaseAll);
  }
}

function releaseConnection(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount !== 0 || pendingRelease) return;
  pendingRelease = setTimeout(() => {
    pendingRelease = null;
    if (refCount === 0) releaseAll();
  }, RELEASE_GRACE_MS);
}

function on<K extends ChatEvent>(event: K, handler: (payload: ChatEventMap[K]) => void): () => void {
  listeners[event].add(handler);
  return () => listeners[event].delete(handler);
}

function typing(conversationId: string | null): void {
  if (!connection || connection.state !== HubConnectionState.Connected) return;
  void connection.invoke("Typing", conversationId).catch(() => {});
}

/** Mount once per area (shop layout / admin layout) to own the chat socket's lifecycle. */
export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    acquireConnection(userId);
    return () => releaseConnection();
  }, [isAuthenticated, userId]);

  return children;
}

/** Subscribe to chat hub events and emit typing. Safe to call even before the socket connects. */
export function useChatSocket() {
  return { on, typing } as const;
}
