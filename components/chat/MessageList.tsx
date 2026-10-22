"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import { Spin, Typography } from "antd";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessageDto, ChatSenderRole } from "@/types/chat";

const { Text } = Typography;

function dayLabel(iso: string): string {
  const date = dayjs(iso);
  const today = dayjs();
  if (date.isSame(today, "day")) return "Hôm nay";
  if (date.isSame(today.subtract(1, "day"), "day")) return "Hôm qua";
  return date.format("DD/MM/YYYY");
}

interface MessageListProps {
  messages: ChatMessageDto[];
  currentRole: ChatSenderRole;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  /** lastReadAt of the other side of the conversation, for the "Đã xem" indicator. */
  otherSideLastReadAt: string | null;
  isTyping?: boolean;
}

export default function MessageList({
  messages,
  currentRole,
  hasMore,
  isFetchingMore,
  onLoadMore,
  otherSideLastReadAt,
  isTyping,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingRestoreRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const isNearBottomRef = useRef(true);
  const initializedRef = useRef(false);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 40 && hasMore && !isFetchingMore) {
      pendingRestoreRef.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop };
      onLoadMore();
    }
  }

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!initializedRef.current) {
      if (messages.length > 0) {
        el.scrollTop = el.scrollHeight;
        initializedRef.current = true;
      }
      return;
    }

    if (pendingRestoreRef.current) {
      const { scrollHeight, scrollTop } = pendingRestoreRef.current;
      el.scrollTop = scrollTop + (el.scrollHeight - scrollHeight);
      pendingRestoreRef.current = null;
      return;
    }

    if (isNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].senderRole === currentRole) return messages[i].id;
    }
    return null;
  }, [messages, currentRole]);

  const showSeen = useMemo(() => {
    if (!lastOwnMessageId || !otherSideLastReadAt) return false;
    const lastOwn = messages.find((m) => m.id === lastOwnMessageId);
    if (!lastOwn) return false;
    return !dayjs(otherSideLastReadAt).isBefore(dayjs(lastOwn.createdAt));
  }, [messages, lastOwnMessageId, otherSideLastReadAt]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", display: "flex", flexDirection: "column" }}
    >
      {isFetchingMore && (
        <div style={{ textAlign: "center", padding: 8 }}>
          <Spin size="small" />
        </div>
      )}

      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDaySeparator = !previous || !dayjs(previous.createdAt).isSame(dayjs(message.createdAt), "day");
        const isOwn = message.senderRole === currentRole;

        return (
          <div key={message.id}>
            {showDaySeparator && (
              <div style={{ textAlign: "center", margin: "12px 0" }}>
                <Text style={{ fontSize: 12, color: "var(--color-muted)" }}>{dayLabel(message.createdAt)}</Text>
              </div>
            )}
            <MessageBubble message={message} isOwn={isOwn} role={currentRole} />
            {message.id === lastOwnMessageId && showSeen && (
              <div style={{ textAlign: "right", marginTop: -6, marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: "var(--color-muted)" }}>Đã xem</Text>
              </div>
            )}
          </div>
        );
      })}

      {isTyping && (
        <div style={{ marginTop: 4 }}>
          <TypingIndicator viewerRole={currentRole} />
        </div>
      )}
    </div>
  );
}
