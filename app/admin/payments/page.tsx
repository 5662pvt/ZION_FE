"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { DatePicker, Input, Select, Spin } from "antd";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import PaymentTable from "@/components/admin/payments/PaymentTable";
import { useAdminPayments } from "@/hooks/useAdminPayments";
import type { AdminPaymentListParams, AdminPaymentStatus } from "@/types/adminPayments";
import type { PaymentChannel } from "@/types/payments";

const { RangePicker } = DatePicker;

const STATUS_OPTIONS: { value: AdminPaymentStatus; label: string }[] = [
  { value: "Pending", label: "Đang chờ" },
  { value: "Succeeded", label: "Thành công" },
  { value: "Failed", label: "Thất bại" },
  { value: "Expired", label: "Hết hạn" },
  { value: "Cancelled", label: "Đã huỷ" },
];

const CHANNEL_OPTIONS: { value: PaymentChannel; label: string }[] = [
  { value: "Card", label: "Thẻ" },
  { value: "EWallet", label: "Ví điện tử" },
  { value: "BankTransfer", label: "Chuyển khoản" },
];

const DATE_FORMAT = "YYYY-MM-DD";

function PaymentsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const status = (searchParams.get("status") as AdminPaymentStatus | null) ?? undefined;
  const channel = (searchParams.get("channel") as PaymentChannel | null) ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const orderId = searchParams.get("orderId") ?? undefined;

  const params: AdminPaymentListParams = { page, pageSize, status, channel, from, to, orderId };
  const { data, isLoading, isError, refetch } = useAdminPayments(params);

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
      <PageHeader title="Thanh toán" description="Theo dõi giao dịch thanh toán của đơn hàng" />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Mã đơn hàng"
          defaultValue={orderId}
          onSearch={(value) => updateParams({ orderId: value || undefined })}
          style={{ width: 220 }}
        />
        <Select<AdminPaymentStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
        <Select<PaymentChannel | undefined>
          allowClear
          placeholder="Kênh"
          style={{ width: 160 }}
          value={channel}
          options={CHANNEL_OPTIONS}
          onChange={(value) => updateParams({ channel: value })}
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
        <ErrorState message="Không tải được danh sách thanh toán" onRetry={() => void refetch()} />
      ) : (
        <PaymentTable
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <PaymentsPageContent />
    </Suspense>
  );
}
