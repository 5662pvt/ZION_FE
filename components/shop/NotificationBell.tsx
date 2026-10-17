"use client";

import Link from "next/link";
import { Badge } from "antd";
import { FiBell } from "react-icons/fi";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

interface NotificationBellProps {
  variant?: "icon" | "tab";
  active?: boolean;
}

export default function NotificationBell({ variant = "icon", active }: NotificationBellProps) {
  const { data: unreadCount } = useUnreadNotificationCount();
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

  return (
    <Link href="/account/notifications" aria-label="Thông báo" style={{ display: "inline-flex", fontSize: 20 }}>
      <Badge count={count} showZero={false} overflowCount={99}>
        <FiBell />
      </Badge>
    </Link>
  );
}
