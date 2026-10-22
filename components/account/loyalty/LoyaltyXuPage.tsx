"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Flex, List, Pagination, Segmented, Skeleton, Typography } from "antd";
import LoyaltyHeaderCard from "./LoyaltyHeaderCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { useMyLoyalty, useMyLoyaltyTransactions } from "@/hooks/useLoyalty";
import { ApiError } from "@/services/apiClient";
import type { LoyaltyTransactionDto } from "@/types/loyalty";

const { Text } = Typography;

type LoyaltyTab = "all" | "earned" | "spent";

const EARN_TYPES = new Set(["Earn", "Release", "Refund"]);
const SPEND_TYPES = new Set(["Spend", "Revoke", "Expire"]);

function matchesTab(item: LoyaltyTransactionDto, tab: LoyaltyTab): boolean {
  if (tab === "all") return true;
  if (tab === "earned") {
    if (item.type === "AdminAdjust") return item.points > 0;
    return EARN_TYPES.has(item.type);
  }
  if (item.type === "AdminAdjust") return item.points < 0;
  return SPEND_TYPES.has(item.type);
}

export default function LoyaltyXuPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const tab = (searchParams.get("tab") as LoyaltyTab | null) ?? "all";

  const { data: summary, isLoading: isSummaryLoading } = useMyLoyalty();
  const { data, isLoading, isError, error, refetch } = useMyLoyaltyTransactions({ page, pageSize });

  function updateParams(next: { page?: number; pageSize?: number; tab?: LoyaltyTab }) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(next.page ?? page));
    sp.set("pageSize", String(next.pageSize ?? pageSize));
    sp.set("tab", next.tab ?? tab);
    router.push(`${pathname}?${sp.toString()}`);
  }

  const items = (data?.items ?? []).filter((item) => matchesTab(item, tab));

  return (
    <>
      <PageHeader title="Xu của tôi" />
      <LoyaltyHeaderCard summary={summary} isLoading={isSummaryLoading} />

      <Segmented
        value={tab}
        onChange={(value) => updateParams({ page: 1, tab: value as LoyaltyTab })}
        options={[
          { label: "Tất cả", value: "all" },
          { label: "Đã nhận", value: "earned" },
          { label: "Đã dùng", value: "spent" },
        ]}
        style={{ marginBottom: 16 }}
      />

      {isError ? (
        <ErrorState message={error instanceof ApiError ? error.message : undefined} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : items.length === 0 ? (
        <EmptyState description="Chưa có giao dịch Xu nào" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item: LoyaltyTransactionDto) => (
            <List.Item
              style={{
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: "var(--radius-card)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <Flex justify="space-between" align="center" gap={12} style={{ width: "100%" }}>
                <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text>{item.description}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                  {item.orderId && <Link href={`/orders/${item.orderId}`}>Xem đơn hàng</Link>}
                </Flex>
                <Text strong type={item.points >= 0 ? "success" : "danger"} style={{ whiteSpace: "nowrap" }}>
                  {item.points >= 0 ? `+${item.points}` : item.points} Xu
                </Text>
              </Flex>
            </List.Item>
          )}
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
