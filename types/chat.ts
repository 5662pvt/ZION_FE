export type ChatSenderRole = "Customer" | "Staff";

export type ChatMessageType = "Text" | "Image" | "Product" | "Order";

export interface ChatProductCardDto {
  id: string;
  name: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  imageUrl: string | null;
}

export interface ChatOrderCardDto {
  id: string;
  code: string;
  status: string;
  total: number;
  currency: string;
  firstItemName: string;
  itemCount: number;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  type: ChatMessageType;
  text: string | null;
  imageUrl: string | null;
  product: ChatProductCardDto | null;
  order: ChatOrderCardDto | null;
  createdAt: string;
  staffEmail?: string | null;
}

export interface ConversationDto {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageSender: ChatSenderRole;
  customerUnread: number;
  staffUnread: number;
  customerLastReadAt: string | null;
  staffLastReadAt: string | null;
}

export interface ChatMessagePageDto {
  items: ChatMessageDto[];
  hasMore: boolean;
}

export interface StaffUnreadCountDto {
  conversations: number;
  messages: number;
}

export interface SendChatMessageBody {
  type: "Text" | "Product" | "Order";
  text?: string;
  productId?: string;
  orderId?: string;
}

export interface ChatMessagesParams {
  before?: string;
  beforeId?: string;
  limit?: number;
}

export interface AdminChatConversationsParams {
  unreadOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ChatMessageEventPayload {
  conversationId: string;
  message: ChatMessageDto;
  conversation: ConversationDto;
}

export interface ChatReadEventPayload {
  conversationId: string;
  side: ChatSenderRole;
  readAt: string;
}

export interface ChatTypingEventPayload {
  conversationId: string;
  from: ChatSenderRole;
}

export type PendingChatCard =
  | { type: "Product"; card: ChatProductCardDto }
  | { type: "Order"; card: ChatOrderCardDto };
