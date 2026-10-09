"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Empty, Flex, Select, Table, Tag, type TableProps } from "antd";
import dayjs from "dayjs";
import { useMyOrders } from "@/hooks/useOrders";
import { orderStatusColor, orderStatusLabel } from "@/utils/orderStatus";
import { formatVnd } from "@/utils/money";
import type { OrderStatus, OrderSummaryDto } from "@/types/orders";

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

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;

  const { data, isLoading, isError, refetch } = useMyOrders({ page, pageSize, status });

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
        message="Không tải được danh sách đơn hàng"
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
      render: (value: OrderStatus) => <Tag color={orderStatusColor(value)}>{orderStatusLabel(value)}</Tag>,
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Đơn hàng của tôi</h2>
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
    </>
  );
}
