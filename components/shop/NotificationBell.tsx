"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Divider, Empty, Flex, Popover, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import { FiBell } from "react-icons/fi";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "@/hooks/useMarkAllNotificationsRead";
import type { UserNotificationDto } from "@/types/notifications";

const { Text } = Typography;

interface NotificationBellProps {
  variant?: "icon" | "tab";
  active?: boolean;
}

function RecentNotificationItem({ item, onClick }: { item: UserNotificationDto; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 4px",
        cursor: "pointer",
        borderRadius: 4,
        background: item.isRead ? "transparent" : "var(--color-primary-bg, #f0f7ff)",
      }}
    >
      <Flex align="flex-start" gap={8}>
        {!item.isRead && (
          <span
            style={{
              marginTop: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-primary)",
              flexShrink: 0,
            }}
          />
        )}
        <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text strong={!item.isRead} style={{ fontSize: 13 }}>
            {item.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(item.createdAt).format("HH:mm DD/MM")}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
}

export default function NotificationBell({ variant = "icon", active }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: feed, isLoading } = useNotificationFeed({ page: 1, pageSize: 5 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const count = unreadCount ?? 0;

  if (variant === "tab") {
    return (
      <Link
        href="/account/notifications"
        aria-label="Thông báo"
        aria-current={active ? "page" : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minWidth: 44,
          minHeight: 44,
          padding: "4px 8px",
          fontSize: 11,
          color: active ? "var(--color-action)" : "var(--color-muted)",
        }}
      >
        <Badge count={count} showZero={false} overflowCount={99} size="small">
          <FiBell size={20} aria-hidden />
        </Badge>
        <span>Thông báo</span>
      </Link>
    );
  }

  function handleItemClick(item: UserNotificationDto) {
    if (!item.isRead) markRead.mutate(item.id);
    setOpen(false);
    if (item.orderId) router.push(`/orders/${item.orderId}`);
  }

  const content = (
    <div style={{ width: 320 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          size="small"
          disabled={count === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
          style={{ padding: 0 }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Flex>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (feed?.items.length ?? 0) === 0 ? (
        <Empty description="Chưa có thông báo nào" />
      ) : (
        <Flex vertical gap={4}>
          {feed?.items.map((item) => (
            <RecentNotificationItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </Flex>
      )}
      <Divider style={{ margin: "8px 0" }} />
      <Link href="/account/notifications" onClick={() => setOpen(false)}>
        Xem tất cả
      </Link>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <span aria-label="Thông báo" style={{ display: "inline-flex", fontSize: 20, cursor: "pointer" }}>
        <Badge count={count} showZero={false} overflowCount={99}>
          <FiBell />
        </Badge>
      </span>
    </Popover>
  );
}
