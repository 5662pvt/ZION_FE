"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Flex, List, Pagination, Segmented, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import { FiCheckCircle, FiCreditCard, FiPackage, FiTruck, FiXCircle } from "react-icons/fi";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "@/hooks/useMarkAllNotificationsRead";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { ApiError } from "@/services/apiClient";
import type { UserNotificationDto, UserNotificationType } from "@/types/notifications";

const { Text } = Typography;

const TYPE_META: Record<UserNotificationType, { label: string; icon: ReactNode; color: string }> = {
  OrderPlaced: { label: "Đơn hàng đã đặt", icon: <FiPackage aria-hidden />, color: "var(--color-primary)" },
  OrderConfirmed: { label: "Đơn đã xác nhận", icon: <FiCheckCircle aria-hidden />, color: "var(--color-success)" },
  OrderShipped: { label: "Đơn đang giao", icon: <FiTruck aria-hidden />, color: "var(--color-primary)" },
  OrderCancelled: { label: "Đơn đã huỷ", icon: <FiXCircle aria-hidden />, color: "var(--color-danger)" },
  PaymentCompleted: { label: "Thanh toán thành công", icon: <FiCreditCard aria-hidden />, color: "var(--color-success)" },
  PaymentFailed: { label: "Thanh toán thất bại", icon: <FiCreditCard aria-hidden />, color: "var(--color-danger)" },
  OrderCreatedForReview: { label: "Đơn hàng mới cần xử lý", icon: <FiPackage aria-hidden />, color: "var(--color-primary)" },
  OrderCompleted: { label: "Đơn hàng đã hoàn tất", icon: <FiCheckCircle aria-hidden />, color: "var(--color-success)" },
};

export default function UserNotificationList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const unreadOnly = searchParams.get("unreadOnly") === "1";

  const { data, isLoading, isError, error, refetch } = useNotificationFeed({ page, pageSize, unreadOnly });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  function updateParams(next: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(next.page ?? page));
    sp.set("pageSize", String(next.pageSize ?? pageSize));
    const nextUnreadOnly = next.unreadOnly ?? unreadOnly;
    if (nextUnreadOnly) sp.set("unreadOnly", "1");
    else sp.delete("unreadOnly");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleRowClick(item: UserNotificationDto) {
    if (!item.isRead) markRead.mutate(item.id);
  }

  function handleViewOrder(item: UserNotificationDto, event: MouseEvent) {
    event.stopPropagation();
    if (!item.isRead) markRead.mutate(item.id);
    if (item.orderId) router.push(`/orders/${item.orderId}`);
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Thông báo" />
        <ErrorState message={error instanceof ApiError ? error.message : undefined} onRetry={() => refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Thông báo"
        action={
          <Button size="small" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            Đánh dấu tất cả đã đọc
          </Button>
        }
      />
      <Segmented
        value={unreadOnly ? "unread" : "all"}
        onChange={(value) => updateParams({ page: 1, unreadOnly: value === "unread" })}
        options={[
          { label: "Tất cả", value: "all" },
          { label: "Chưa đọc", value: "unread" },
        ]}
        style={{ marginBottom: 16 }}
      />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState description="Chưa có thông báo nào" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data?.items ?? []}
          renderItem={(item: UserNotificationDto) => {
            const meta = TYPE_META[item.type];
            return (
              <List.Item
                onClick={() => handleRowClick(item)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  marginBottom: 8,
                  borderRadius: "var(--radius-card)",
                  border: "1px solid var(--color-border)",
                  background: item.isRead ? "var(--color-surface)" : "var(--color-accent)",
                }}
              >
                <Flex justify="space-between" align="center" gap={12} style={{ width: "100%" }}>
                  <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        borderRadius: "var(--radius-control)",
                        background: `color-mix(in srgb, ${meta.color} 15%, var(--color-surface))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: meta.color,
                        fontSize: 20,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      <Text type="secondary">{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Flex>
                  </Flex>
                  {item.orderId && (
                    <Button size="small" onClick={(event) => handleViewOrder(item, event)}>
                      Xem đơn hàng
                    </Button>
                  )}
                </Flex>
              </List.Item>
            );
          }}
        />
      )}
      {!isLoading && (data?.pagination.totalCount ?? 0) > 0 && (
        <Flex justify="center" style={{ marginTop: 16 }}>
          <Pagination
            current={data?.pagination.page ?? page}
            pageSize={data?.pagination.pageSize ?? pageSize}
            total={data?.pagination.totalCount ?? 0}
            onChange={(nextPage, nextPageSize) => updateParams({ page: nextPage, pageSize: nextPageSize })}
          />
        </Flex>
      )}
    </>
  );
}
