import { apiGet, apiPost, apiUpload } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AdminChatConversationsParams,
  ChatMessageDto,
  ChatMessagePageDto,
  ChatMessagesParams,
  ConversationDto,
  SendChatMessageBody,
  StaffUnreadCountDto,
} from "@/types/chat";

function buildConversationsQuery(params: AdminChatConversationsParams): string {
  const search = new URLSearchParams();
  if (params.unreadOnly) search.set("unreadOnly", "true");
  if (params.search) search.set("search", params.search);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildMessagesQuery(params: ChatMessagesParams): string {
  const search = new URLSearchParams();
  if (params.before) search.set("before", params.before);
  if (params.beforeId) search.set("beforeId", params.beforeId);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminChatService = {
  getConversations: async (params: AdminChatConversationsParams = {}): Promise<Paged<ConversationDto>> => {
    const { data, pagination } = await apiGet<ConversationDto[]>(
      `/api/v1/admin/chat/conversations${buildConversationsQuery(params)}`
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getConversation: (id: string) => apiGet<ConversationDto>(`/api/v1/admin/chat/conversations/${id}`).then((r) => r.data),

  getMessages: (id: string, params: ChatMessagesParams = {}) =>
    apiGet<ChatMessagePageDto>(`/api/v1/admin/chat/conversations/${id}/messages${buildMessagesQuery(params)}`).then(
      (r) => r.data
    ),

  sendMessage: (id: string, body: SendChatMessageBody) =>
    apiPost<ChatMessageDto>(`/api/v1/admin/chat/conversations/${id}/messages`, body).then((r) => r.data),

  sendImage: (id: string, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    return apiUpload<ChatMessageDto>(`/api/v1/admin/chat/conversations/${id}/images`, formData).then((r) => r.data);
  },

  markRead: (id: string) => apiPost<ConversationDto>(`/api/v1/admin/chat/conversations/${id}/read`).then((r) => r.data),

  getUnreadCount: () => apiGet<StaffUnreadCountDto>("/api/v1/admin/chat/unread-count").then((r) => r.data),
};
