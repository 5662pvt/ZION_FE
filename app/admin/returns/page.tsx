"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, Spin } from "antd";
import AdminReturnTable from "@/components/admin/returns/AdminReturnTable";
import { useAdminReturns } from "@/hooks/useReturns";
import { returnStatusLabel } from "@/utils/returns";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { AdminReturnListParams, ReturnRequestStatus } from "@/types/returns";

const STATUS_VALUES: ReturnRequestStatus[] = ["Requested", "Approved", "Rejected", "ShippedBack", "Received", "Refunded"];
const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({ value, label: returnStatusLabel(value) }));

function ReturnsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const status = (searchParams.get("status") as ReturnRequestStatus | null) ?? undefined;

  const params: AdminReturnListParams = { page, pageSize, status };
  const { data, isLoading, isError, refetch } = useAdminReturns(params);

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div>
      <PageHeader title="Trả hàng" description="Quản lý yêu cầu trả hàng và hoàn tiền" />

      <FilterBar>
        <Select<ReturnRequestStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 220 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách yêu cầu trả hàng" onRetry={() => void refetch()} />
      ) : (
        <AdminReturnTable
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

export default function AdminReturnsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <ReturnsPageContent />
    </Suspense>
  );
}
