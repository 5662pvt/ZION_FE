"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { adminChatService } from "@/services/adminChat.service";
import { useChatSocket } from "@/hooks/useChatSocket";
import { queryKeys } from "@/constants/queryKeys";
import type {
  AdminChatConversationsParams,
  ChatMessageDto,
  ChatMessageEventPayload,
  ChatMessagePageDto,
  ChatReadEventPayload,
  ConversationDto,
  SendChatMessageBody,
} from "@/types/chat";

const MESSAGES_PAGE_SIZE = 30;

/** Conversation list, paged via `fetchNextPage` — `params.page` is ignored (internal page cursor instead). */
export function useAdminChatConversations(params: AdminChatConversationsParams = {}) {
  const { unreadOnly, search, pageSize } = params;
  const filters = { unreadOnly, search, pageSize };
  return useInfiniteQuery({
    queryKey: queryKeys.adminChat.conversations(filters),
    queryFn: ({ pageParam }) => adminChatService.getConversations({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useAdminChatConversation(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminChat.conversation(id ?? ""),
    queryFn: () => adminChatService.getConversation(id as string),
    enabled: !!id,
  });
}

interface MessagesPageParam {
  before: string;
  beforeId: string;
}

export function useAdminChatMessages(id: string | null) {
  return useInfiniteQuery({
    queryKey: queryKeys.adminChat.messages(id ?? ""),
    queryFn: ({ pageParam }) =>
      adminChatService.getMessages(id as string, {
        before: pageParam?.before,
        beforeId: pageParam?.beforeId,
        limit: MESSAGES_PAGE_SIZE,
      }),
    initialPageParam: undefined as MessagesPageParam | undefined,
    getNextPageParam: (lastPage): MessagesPageParam | undefined => {
      const oldest = lastPage.items[lastPage.items.length - 1];
      return lastPage.hasMore && oldest ? { before: oldest.createdAt, beforeId: oldest.id } : undefined;
    },
    enabled: !!id,
  });
}

export function useAdminChatUnreadCount() {
  return useQuery({
    queryKey: queryKeys.adminChat.unreadCount(),
    queryFn: adminChatService.getUnreadCount,
    staleTime: 10_000,
  });
}

function upsertAdminMessageIntoCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  message: ChatMessageDto
): void {
  queryClient.setQueryData<InfiniteData<ChatMessagePageDto>>(queryKeys.adminChat.messages(conversationId), (old) => {
    if (!old) return old;
    const firstPage = old.pages[0];
    if (!firstPage || firstPage.items.some((m) => m.id === message.id)) return old;
    const nextFirstPage: ChatMessagePageDto = { ...firstPage, items: [message, ...firstPage.items] };
    return { ...old, pages: [nextFirstPage, ...old.pages.slice(1)] };
  });
}

export function useSendAdminMessage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendChatMessageBody) => adminChatService.sendMessage(id, body),
    onSuccess: (message) => {
      upsertAdminMessageIntoCache(queryClient, id, message);
      void queryClient.invalidateQueries({ queryKey: ["adminChat", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminChat.unreadCount() });
    },
  });
}

export function useSendAdminImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) => adminChatService.sendImage(id, file, caption),
    onSuccess: (message) => {
      upsertAdminMessageIntoCache(queryClient, id, message);
      void queryClient.invalidateQueries({ queryKey: ["adminChat", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminChat.unreadCount() });
    },
  });
}

export function useMarkAdminChatRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminChatService.markRead(id),
    onSuccess: (conversation) => {
      queryClient.setQueryData(queryKeys.adminChat.conversation(id), conversation);
      void queryClient.invalidateQueries({ queryKey: ["adminChat", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminChat.unreadCount() });
    },
  });
}

/**
 * Wires chat:message / chat:read socket events into the admin caches above. `activeConversationId`
 * is the conversation currently open in the inbox (if any) — its message cache gets the live
 * append; every conversation's unread/list state gets invalidated so the inbox list stays current.
 */
export function useAdminChatRealtimeSync(activeConversationId: string | null): void {
  const { on } = useChatSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const offMessage = on("chat:message", (payload: ChatMessageEventPayload) => {
      if (payload.conversationId === activeConversationId) {
        upsertAdminMessageIntoCache(queryClient, payload.conversationId, payload.message);
      }
      void queryClient.invalidateQueries({ queryKey: ["adminChat", "conversations"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminChat.unreadCount() });
      queryClient.setQueryData(queryKeys.adminChat.conversation(payload.conversationId), payload.conversation);
    });

    const offRead = on("chat:read", (payload: ChatReadEventPayload) => {
      if (payload.side !== "Customer") return;
      queryClient.setQueryData<ConversationDto | undefined>(
        queryKeys.adminChat.conversation(payload.conversationId),
        (old) => (old ? { ...old, customerLastReadAt: payload.readAt } : old)
      );
    });

    return () => {
      offMessage();
      offRead();
    };
  }, [activeConversationId, on, queryClient]);
}
