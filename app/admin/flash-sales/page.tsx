"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Spin } from "antd";
import FlashSaleTable from "@/components/admin/flash-sales/FlashSaleTable";
import { useAdminFlashSales } from "@/hooks/useAdminFlashSales";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { FlashSaleListParams } from "@/types/flashSales";

function FlashSalesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;

  const params: FlashSaleListParams = { page, pageSize, keyword };
  const { data, isLoading, isError, refetch } = useAdminFlashSales(params);

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
      <PageHeader
        title="Flash Sale"
        description="Quản lý chiến dịch flash sale"
        action={
          <Link href="/admin/flash-sales/new">
            <Button type="primary">Tạo flash sale</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên flash sale"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 240 }}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách flash sale" onRetry={() => void refetch()} />
      ) : (
        <FlashSaleTable
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

export default function AdminFlashSalesPage() {
  return (
    <Suspense fallback={<Spin />}>
      <FlashSalesPageContent />
    </Suspense>
  );
}
