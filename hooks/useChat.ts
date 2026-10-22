"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { useAuth } from "@/hooks/useAuth";
import { useChatSocket } from "@/hooks/useChatSocket";
import { queryKeys } from "@/constants/queryKeys";
import type {
  ChatMessageDto,
  ChatMessageEventPayload,
  ChatMessagePageDto,
  ChatReadEventPayload,
  ConversationDto,
  SendChatMessageBody,
} from "@/types/chat";

const MESSAGES_PAGE_SIZE = 30;

export function useMyConversation() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.chat.conversation(),
    queryFn: chatService.getMyConversation,
    enabled: isAuthenticated,
    staleTime: 10_000,
  });
}

export function useMyMessages() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(),
    queryFn: ({ pageParam }) => chatService.getMyMessages({ before: pageParam, limit: MESSAGES_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.items.length > 0 ? lastPage.items[lastPage.items.length - 1].createdAt : undefined,
    enabled: isAuthenticated,
  });
}

/** Pages are newest-first; flatten to chronological (oldest first) order for rendering. */
export function flattenChatMessages(pages: ChatMessagePageDto[] | undefined): ChatMessageDto[] {
  if (!pages) return [];
  const result: ChatMessageDto[] = [];
  for (let i = pages.length - 1; i >= 0; i -= 1) {
    const items = pages[i].items;
    for (let j = items.length - 1; j >= 0; j -= 1) result.push(items[j]);
  }
  return result;
}

function upsertMessageIntoCache(queryClient: QueryClient, message: ChatMessageDto): void {
  queryClient.setQueryData<InfiniteData<ChatMessagePageDto>>(queryKeys.chat.messages(), (old) => {
    if (!old) return old;
    const firstPage = old.pages[0];
    if (!firstPage || firstPage.items.some((m) => m.id === message.id)) return old;
    const nextFirstPage: ChatMessagePageDto = { ...firstPage, items: [message, ...firstPage.items] };
    return { ...old, pages: [nextFirstPage, ...old.pages.slice(1)] };
  });
}

export function useSendMyMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendChatMessageBody) => chatService.sendMessage(body),
    onSuccess: (message) => {
      upsertMessageIntoCache(queryClient, message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversation() });
    },
  });
}

export function useSendMyImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) => chatService.sendImage(file, caption),
    onSuccess: (message) => {
      upsertMessageIntoCache(queryClient, message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversation() });
    },
  });
}

export function useMarkMyChatRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.markRead,
    onSuccess: (conversation) => {
      queryClient.setQueryData(queryKeys.chat.conversation(), conversation);
    },
  });
}

/** Wires chat:message / chat:read socket events into the React Query caches above. Mount once. */
export function useChatRealtimeSync(): void {
  const { isAuthenticated } = useAuth();
  const { on } = useChatSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const offMessage = on("chat:message", (payload: ChatMessageEventPayload) => {
      upsertMessageIntoCache(queryClient, payload.message);
      queryClient.setQueryData(queryKeys.chat.conversation(), payload.conversation);
    });

    const offRead = on("chat:read", (payload: ChatReadEventPayload) => {
      if (payload.side !== "Staff") return;
      queryClient.setQueryData<ConversationDto | undefined>(queryKeys.chat.conversation(), (old) =>
        old ? { ...old, staffLastReadAt: payload.readAt } : old
      );
    });

    return () => {
      offMessage();
      offRead();
    };
  }, [isAuthenticated, on, queryClient]);
}

/** True for `timeoutMs` after the last chat:typing event from `from`, then auto-clears. */
export function useIncomingChatTyping(from: "Staff" | "Customer", timeoutMs = 4000): boolean {
  const { on } = useChatSocket();
  const [typing, setTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const off = on("chat:typing", (payload) => {
      if (payload.from !== from) return;
      setTyping(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setTyping(false), timeoutMs);
    });
    return () => {
      off();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [on, from, timeoutMs]);

  return typing;
}
