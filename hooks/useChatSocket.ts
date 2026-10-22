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
let connection: HubConnection | null = null;
let refCount = 0;
let unauthUnsubscribe: (() => void) | null = null;

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

  conn.onclose((error) => console.warn("Chat socket closed", error));

  return conn;
}

function releaseAll(): void {
  refCount = 0;
  const current = connection;
  connection = null;
  if (current && current.state !== HubConnectionState.Disconnected) {
    void current.stop();
  }
}

function acquireConnection(): void {
  refCount += 1;
  if (connection) return;

  connection = buildConnection();
  connection.start().catch((error) => console.warn("Chat socket failed to connect", error));

  if (!unauthUnsubscribe) {
    unauthUnsubscribe = onAuthCleared(releaseAll);
  }
}

function releaseConnection(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) releaseAll();
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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    acquireConnection();
    return () => releaseConnection();
  }, [isAuthenticated]);

  return children;
}

/** Subscribe to chat hub events and emit typing. Safe to call even before the socket connects. */
export function useChatSocket() {
  return { on, typing } as const;
}
