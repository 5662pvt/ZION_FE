"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Flex, List, Pagination, Skeleton, Typography } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { FiCheckCircle, FiTruck, FiXCircle } from "react-icons/fi";
import { useMyNotifications } from "@/hooks/useMyNotifications";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { ApiError } from "@/services/apiClient";
import type { NotificationDto, NotificationType } from "@/types/notifications";

const { Text } = Typography;

const TYPE_META: Record<NotificationType, { label: string; icon: ReactNode; color: string }> = {
  OrderConfirmed: { label: "Đơn đã xác nhận", icon: <FiCheckCircle aria-hidden />, color: "var(--color-success)" },
  OrderShipped: { label: "Đơn đang giao", icon: <FiTruck aria-hidden />, color: "var(--color-primary)" },
  OrderCancelled: { label: "Đơn đã huỷ", icon: <FiXCircle aria-hidden />, color: "var(--color-danger)" },
};

export default function NotificationList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const { data, isLoading, isError, error, refetch } = useMyNotifications({ page, pageSize });

  function updatePage(nextPage: number, nextPageSize: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nextPage));
    sp.set("pageSize", String(nextPageSize));
    router.push(`${pathname}?${sp.toString()}`);
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
      <PageHeader title="Thông báo" />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState description="Chưa có thông báo nào" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data?.items ?? []}
          renderItem={(item: NotificationDto) => {
            const meta = TYPE_META[item.type];
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<span style={{ color: meta.color, fontSize: 20 }}>{meta.icon}</span>}
                  title={meta.label}
                  description={
                    <Flex vertical gap={4}>
                      <Text>{item.subject}</Text>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                        {item.orderId && <Link href={`/orders/${item.orderId}`}>Xem đơn hàng</Link>}
                      </Flex>
                    </Flex>
                  }
                />
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
            onChange={updatePage}
          />
        </Flex>
      )}
    </>
  );
}
