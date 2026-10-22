"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Button, Flex, Typography } from "antd";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  flattenChatMessages,
  useChatRealtimeSync,
  useIncomingChatTyping,
  useMarkMyChatRead,
  useMyConversation,
  useMyMessages,
  useSendMyImage,
  useSendMyMessage,
} from "@/hooks/useChat";
import { clearPendingChatCard, closeChatWidget, openChatWidget, useChatWidgetState } from "@/hooks/useChatWidgetStore";
import MessageList from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import PendingCardBar from "@/components/chat/PendingCardBar";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";

const { Text, Title } = Typography;

export default function ChatWidget() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isOpen, pendingCard } = useChatWidgetState();

  useChatRealtimeSync();
  const isStaffTyping = useIncomingChatTyping("Staff");
  const { typing } = useChatSocket();

  const { data: conversation } = useMyConversation();
  const messagesQuery = useMyMessages();
  const sendMessage = useSendMyMessage();
  const sendImage = useSendMyImage();
  const markRead = useMarkMyChatRead();

  const messages = flattenChatMessages(messagesQuery.data?.pages);
  const unread = conversation?.customerUnread ?? 0;

  // Mark read once per open and once per incoming message while the widget stays open;
  // `unread` (not message ids) is the signal because the message list loads async and
  // would otherwise look like a second "new message" right after the open-triggered read.
  const lastMarkedUnreadRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      lastMarkedUnreadRef.current = null;
      return;
    }
    if (unread <= 0) {
      lastMarkedUnreadRef.current = null;
      return;
    }
    if (unread !== lastMarkedUnreadRef.current) {
      lastMarkedUnreadRef.current = unread;
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated, unread]);

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

  function handleSendPendingCard() {
    if (!pendingCard) return;
    const body =
      pendingCard.type === "Product"
        ? { type: "Product" as const, productId: pendingCard.card.id }
        : { type: "Order" as const, orderId: pendingCard.card.id };
    sendMessage.mutate(body, {
      onSuccess: () => clearPendingChatCard(),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi thất bại"),
    });
  }

  return (
    <>
      <button
        type="button"
        className="zion-chat-fab"
        aria-label={isOpen ? "Đóng chat với ZIONShop" : "Mở chat với ZIONShop"}
        onClick={() => (isOpen ? closeChatWidget() : openChatWidget())}
      >
        <Badge count={unread} size="small" offset={[-2, 2]}>
          <FiMessageCircle size={24} aria-hidden />
        </Badge>
      </button>

      {isOpen && (
        <div className="zion-chat-panel" role="dialog" aria-label="Chat với ZIONShop">
          <Flex justify="space-between" align="center" className="zion-chat-panel__header">
            <Title level={5} style={{ margin: 0, color: "#fff" }}>
              Chat với ZIONShop
            </Title>
            <Button type="text" icon={<FiX color="#fff" aria-hidden />} aria-label="Đóng" onClick={() => closeChatWidget()} />
          </Flex>

          {!isAuthenticated ? (
            <Flex
              vertical
              align="center"
              justify="center"
              gap={12}
              style={{ flex: 1, padding: 24, textAlign: "center" }}
            >
              <Text>Đăng nhập để chat với shop</Text>
              <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>
                <Button type="primary">Đăng nhập</Button>
              </Link>
            </Flex>
          ) : (
            <>
              <MessageList
                messages={messages}
                currentRole="Customer"
                hasMore={messagesQuery.hasNextPage ?? false}
                isFetchingMore={messagesQuery.isFetchingNextPage}
                onLoadMore={() => void messagesQuery.fetchNextPage()}
                otherSideLastReadAt={conversation?.staffLastReadAt ?? null}
                isTyping={isStaffTyping}
              />
              {pendingCard && (
                <PendingCardBar
                  pendingCard={pendingCard}
                  onCancel={clearPendingChatCard}
                  onSend={handleSendPendingCard}
                  sending={sendMessage.isPending}
                />
              )}
              <Composer
                onSendText={handleSendText}
                onSendImage={handleSendImage}
                onTyping={() => typing(null)}
                sending={sendMessage.isPending || sendImage.isPending}
              />
            </>
          )}
        </div>
      )}

      <style>{`
        .zion-chat-fab {
          position: fixed;
          right: 16px;
          bottom: 88px;
          z-index: 999;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: var(--color-action);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-card);
          cursor: pointer;
        }
        .zion-chat-panel {
          position: fixed;
          right: 16px;
          bottom: 148px;
          z-index: 999;
          width: 360px;
          height: 520px;
          background: var(--color-surface);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .zion-chat-panel__header {
          padding: 12px 16px;
          background: var(--color-primary);
        }
        @media (min-width: 1024px) {
          .zion-chat-fab { bottom: 24px; }
          .zion-chat-panel { bottom: 84px; }
        }
        @media (max-width: 575px) {
          .zion-chat-fab { bottom: 72px; }
          .zion-chat-panel {
            right: 0;
            bottom: 0;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
}
