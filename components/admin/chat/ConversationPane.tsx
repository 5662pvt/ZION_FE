"use client";

import { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import {
  flattenChatMessages,
  useIncomingChatTyping,
} from "@/hooks/useChat";
import {
  useAdminChatConversation,
  useAdminChatMessages,
  useAdminChatRealtimeSync,
  useMarkAdminChatRead,
  useSendAdminImage,
  useSendAdminMessage,
} from "@/hooks/useAdminChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import MessageList from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import ConversationHeader from "./ConversationHeader";
import OrderPickerModal from "./OrderPickerModal";
import ProductPickerModal from "./ProductPickerModal";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import styles from "./ConversationPane.module.css";

interface ConversationPaneProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationPane({ conversationId, onBack }: ConversationPaneProps) {
  const { data: conversation, isLoading } = useAdminChatConversation(conversationId);
  const messagesQuery = useAdminChatMessages(conversationId);
  const sendMessage = useSendAdminMessage(conversationId);
  const sendImage = useSendAdminImage(conversationId);
  const markRead = useMarkAdminChatRead(conversationId);
  const { typing } = useChatSocket();
  const isCustomerTyping = useIncomingChatTyping("Customer");

  useAdminChatRealtimeSync(conversationId);

  const [orderPickerOpen, setOrderPickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const messages = flattenChatMessages(messagesQuery.data?.pages);
  const lastMessageId = messages[messages.length - 1]?.id;
  const lastMarkedMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    lastMarkedMessageIdRef.current = undefined;
  }, [conversationId]);

  useEffect(() => {
    function tryMarkRead() {
      if (document.visibilityState !== "visible") return;
      if (lastMessageId === undefined) return;
      if (lastMessageId === lastMarkedMessageIdRef.current) return;
      markRead.mutate();
      lastMarkedMessageIdRef.current = lastMessageId;
    }
    tryMarkRead();
    document.addEventListener("visibilitychange", tryMarkRead);
    return () => document.removeEventListener("visibilitychange", tryMarkRead);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastMessageId]);

  function handleSendText(text: string) {
    sendMessage.mutate(
      { type: "Text", text },
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi tin nhắn thất bại") }
    );
  }

  function handleSendImage(file: File) {
    sendImage.mutate(
      { file },
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi hình ảnh thất bại") }
    );
  }

  if (isLoading || !conversation) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <ConversationHeader
        conversation={conversation}
        onBack={onBack}
        onSendOrder={() => setOrderPickerOpen(true)}
        onSendProduct={() => setProductPickerOpen(true)}
      />

      <MessageList
        messages={messages}
        currentRole="Staff"
        hasMore={messagesQuery.hasNextPage ?? false}
        isFetchingMore={messagesQuery.isFetchingNextPage}
        onLoadMore={() => void messagesQuery.fetchNextPage()}
        otherSideLastReadAt={conversation.customerLastReadAt}
        isTyping={isCustomerTyping}
      />

      <Composer
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onTyping={() => typing(conversationId)}
        sending={sendMessage.isPending || sendImage.isPending}
      />

      <OrderPickerModal
        open={orderPickerOpen}
        conversationId={conversationId}
        customerName={conversation.customerName}
        onClose={() => setOrderPickerOpen(false)}
      />
      <ProductPickerModal open={productPickerOpen} conversationId={conversationId} onClose={() => setProductPickerOpen(false)} />
    </div>
  );
}
