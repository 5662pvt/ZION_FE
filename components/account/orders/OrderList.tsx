"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Flex,
  Pagination,
  Select,
  Skeleton,
  Space,
  Table,
  Typography,
  type TableProps,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMyOrders } from "@/hooks/useOrders";
import { orderStatusLabel } from "@/utils/orderStatus";
import { formatVnd } from "@/utils/money";
import { ApiError } from "@/services/apiClient";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus, OrderSummaryDto } from "@/types/orders";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const DATE_FORMAT = "YYYY-MM-DD";

function disabledDateRange(current: Dayjs, { from }: { from?: Dayjs }) {
  if (!from) return false;
  return Math.abs(current.diff(from, "day")) > 366;
}

function subscribeToMobileViewport(callback: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 639px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsMobileViewport() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function getIsMobileViewportServerSnapshot() {
  return false;
}

function useIsMobileViewport() {
  return useSyncExternalStore(subscribeToMobileViewport, getIsMobileViewport, getIsMobileViewportServerSnapshot);
}

const STATUS_OPTIONS: OrderStatus[] = [
  "PendingStock",
  "AwaitingPayment",
  "Confirmed",
  "Paid",
  "Shipped",
  "Completed",
  "Cancelled",
];

export default function OrderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobileViewport();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const { data, isLoading, isError, error, refetch } = useMyOrders({ page, pageSize, status, from, to });

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  if (isError) {
    return (
      <Alert
        type="error"
        message={error instanceof ApiError ? error.message : "Không tải được danh sách đơn hàng"}
        action={
          <Button size="small" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
        showIcon
      />
    );
  }

  const columns: TableProps<OrderSummaryDto>["columns"] = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      render: (code: string, record) => <Link href={`/orders/${record.id}`}>{code}</Link>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Số sản phẩm", dataIndex: "itemCount" },
    { title: "Tổng tiền", dataIndex: "total", render: (value: number) => formatVnd(value) },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value: OrderStatus) => <OrderStatusBadge status={value} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => <Link href={`/orders/${record.id}`}>Xem chi tiết</Link>,
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Đơn hàng của tôi</h2>
        <Flex wrap="wrap" gap={12}>
          <RangePicker
            value={from && to ? [dayjs(from), dayjs(to)] : null}
            format="DD/MM/YYYY"
            disabledDate={disabledDateRange}
            allowClear
            onChange={(_, dateStrings) => {
              const [nextFrom, nextTo] = dateStrings;
              updateParams({
                from: nextFrom ? dayjs(nextFrom, "DD/MM/YYYY").format(DATE_FORMAT) : undefined,
                to: nextTo ? dayjs(nextTo, "DD/MM/YYYY").format(DATE_FORMAT) : undefined,
              });
            }}
          />
          <Select
            style={{ width: 200 }}
            value={status ?? ""}
            options={[
              { value: "", label: "Tất cả" },
              ...STATUS_OPTIONS.map((s) => ({ value: s, label: orderStatusLabel(s) })),
            ]}
            onChange={(value: string) => updateParams({ status: value || undefined })}
          />
        </Flex>
      </Flex>
      {isMobile ? (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}
          {!isLoading && (data?.items.length ?? 0) === 0 && (
            <Empty description="Chưa có đơn hàng nào">
              <Link href="/products">
                <Button type="primary">Mua sắm ngay</Button>
              </Link>
            </Empty>
          )}
          {!isLoading &&
            data?.items.map((order) => (
              <Card key={order.id} size="small">
                <Flex justify="space-between" align="flex-start" gap={8}>
                  <div>
                    <div>
                      <Link href={`/orders/${order.id}`}>
                        <Text strong>{order.code}</Text>
                      </Link>
                    </div>
                    <Text type="secondary">{dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Flex>
                <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                  <Text type="secondary">{order.itemCount} sản phẩm</Text>
                  <Text strong>{formatVnd(order.total)}</Text>
                </Flex>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/orders/${order.id}`}>Xem chi tiết</Link>
                </div>
              </Card>
            ))}
          {!isLoading && (data?.pagination.totalCount ?? 0) > 0 && (
            <Flex justify="center" style={{ marginTop: 8 }}>
              <Pagination
                current={data?.pagination.page ?? page}
                pageSize={data?.pagination.pageSize ?? pageSize}
                total={data?.pagination.totalCount ?? 0}
                onChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
              />
            </Flex>
          )}
        </Space>
      ) : (
        <Table<OrderSummaryDto>
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items ?? []}
          columns={columns}
          scroll={{ x: 600 }}
          locale={{
            emptyText: (
              <Empty description="Chưa có đơn hàng nào">
                <Link href="/products">
                  <Button type="primary">Mua sắm ngay</Button>
                </Link>
              </Empty>
            ),
          }}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
            onChange: (p, ps) => updateParams({ page: String(p), pageSize: String(ps) }),
          }}
        />
      )}
    </>
  );
}
