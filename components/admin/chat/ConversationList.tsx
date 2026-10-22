"use client";

import { useMemo, useState } from "react";
import { Avatar, Badge, Input, Segmented, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import { FiSearch } from "react-icons/fi";
import { useAdminChatConversations } from "@/hooks/useAdminChat";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "./useDebouncedValue";
import type { ConversationDto } from "@/types/chat";
import styles from "./ConversationList.module.css";

const { Text } = Typography;

const PAGE_SIZE = 20;

function relativeTime(iso: string): string {
  const date = dayjs(iso);
  const now = dayjs();
  if (date.isSame(now, "day")) return date.format("HH:mm");
  if (date.isSame(now.subtract(1, "day"), "day")) return "Hôm qua";
  return date.format("DD/MM/YYYY");
}

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (conversation: ConversationDto) => void;
}

export default function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300).trim();

  const params = useMemo(
    () => ({ unreadOnly, search: debouncedSearch || undefined, pageSize: PAGE_SIZE }),
    [unreadOnly, debouncedSearch]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAdminChatConversations(params);
  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const showSkeleton = isLoading && items.length === 0;

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <Input
          allowClear
          prefix={<FiSearch aria-hidden />}
          placeholder="Tìm theo tên hoặc email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Tìm cuộc trò chuyện"
        />
        <Segmented
          block
          className={styles.segmented}
          value={unreadOnly ? "unread" : "all"}
          onChange={(value) => setUnreadOnly(value === "unread")}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Chưa đọc", value: "unread" },
          ]}
        />
      </div>

      <div className={styles.list}>
        {showSkeleton ? (
          <div className={styles.skeletonWrap}>
            <Skeleton active avatar paragraph={{ rows: 1 }} />
            <Skeleton active avatar paragraph={{ rows: 1 }} />
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState description="Không có cuộc trò chuyện" />
        ) : (
          <>
            {items.map((conversation) => {
              const isUnread = conversation.staffUnread > 0;
              const isActive = conversation.id === selectedId;
              const previewPrefix = conversation.lastMessageSender === "Staff" ? "Bạn: " : "";
              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                  onClick={() => onSelect(conversation)}
                >
                  <Avatar className={styles.avatar}>{conversation.customerName.charAt(0).toUpperCase()}</Avatar>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <Text className={styles.name} strong={isUnread}>
                        {conversation.customerName}
                      </Text>
                      <Text className={styles.time}>{relativeTime(conversation.lastMessageAt)}</Text>
                    </div>
                    <Text className={styles.email} type="secondary">
                      {conversation.customerEmail}
                    </Text>
                    <div className={styles.itemBottom}>
                      <Text className={styles.preview} strong={isUnread} type={isUnread ? undefined : "secondary"}>
                        {previewPrefix}
                        {conversation.lastMessagePreview}
                      </Text>
                      {isUnread && <Badge count={conversation.staffUnread} size="small" />}
                    </div>
                  </div>
                </button>
              );
            })}
            {hasNextPage && (
              <button
                type="button"
                className={styles.loadMore}
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
