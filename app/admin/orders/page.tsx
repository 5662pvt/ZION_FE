"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { DatePicker, Input, Select, Spin } from "antd";
import AdminOrderTable from "@/components/admin/orders/AdminOrderTable";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { orderStatusLabel } from "@/utils/orderStatus";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { AdminOrderListParams } from "@/types/adminOrders";
import type { OrderStatus } from "@/types/orders";

const { RangePicker } = DatePicker;

const STATUS_VALUES: OrderStatus[] = [
  "PendingStock",
  "AwaitingPayment",
  "Confirmed",
  "Paid",
  "Shipped",
  "Completed",
  "Cancelled",
  "Returned",
];

const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({ value, label: orderStatusLabel(value) }));

const DATE_FORMAT = "YYYY-MM-DD";

function OrdersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const params: AdminOrderListParams = { page, pageSize, keyword, status, from, to };
  const { data, isLoading, isError, refetch } = useAdminOrders(params);

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  const rangeValue: [Dayjs, Dayjs] | undefined = from && to ? [dayjs(from), dayjs(to)] : undefined;

  return (
    <div>
      <PageHeader title="Đơn hàng" description="Quản lý đơn hàng và trạng thái giao hàng" />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Mã đơn / tên / SĐT"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 240 }}
        />
        <Select<OrderStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 180 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
        <RangePicker
          value={rangeValue}
          onChange={(values) =>
            updateParams({
              from: values?.[0] ? values[0].format(DATE_FORMAT) : undefined,
              to: values?.[1] ? values[1].format(DATE_FORMAT) : undefined,
            })
          }
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách đơn hàng" onRetry={() => void refetch()} />
      ) : (
        <AdminOrderTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Spin />}>
      <OrdersPageContent />
    </Suspense>
  );
}
