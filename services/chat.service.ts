import { apiGet, apiPost, apiUpload } from "./apiClient";
import type { ChatMessageDto, ChatMessagePageDto, ChatMessagesParams, ConversationDto, SendChatMessageBody } from "@/types/chat";

function buildMessagesQuery(params: ChatMessagesParams): string {
  const search = new URLSearchParams();
  if (params.before) search.set("before", params.before);
  if (params.beforeId) search.set("beforeId", params.beforeId);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const chatService = {
  getMyConversation: () => apiGet<ConversationDto>("/api/v1/chat/me").then((r) => r.data),

  getMyMessages: (params: ChatMessagesParams = {}) =>
    apiGet<ChatMessagePageDto>(`/api/v1/chat/me/messages${buildMessagesQuery(params)}`).then((r) => r.data),

  sendMessage: (body: SendChatMessageBody) =>
    apiPost<ChatMessageDto>("/api/v1/chat/me/messages", body).then((r) => r.data),

  sendImage: (file: File, caption?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    return apiUpload<ChatMessageDto>("/api/v1/chat/me/images", formData).then((r) => r.data);
  },

  markRead: () => apiPost<ConversationDto>("/api/v1/chat/me/read").then((r) => r.data),
};
