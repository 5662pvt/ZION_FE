"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Select, Spin } from "antd";
import PromotionTable from "@/components/admin/promotions/PromotionTable";
import { useAdminPromotions } from "@/hooks/useAdminPromotions";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { PromotionListParams, PromotionStatus } from "@/types/promotions";

const STATUS_OPTIONS: { value: PromotionStatus; label: string }[] = [
  { value: "Active", label: "Đang chạy" },
  { value: "Inactive", label: "Tạm tắt" },
  { value: "Scheduled", label: "Sắp diễn ra" },
  { value: "Expired", label: "Hết hạn" },
];

function PromotionsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const status = (searchParams.get("status") as PromotionStatus | null) ?? undefined;

  const params: PromotionListParams = { page, pageSize, keyword, status };
  const { data, isLoading, isError, refetch } = useAdminPromotions(params);

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
        title="Khuyến mãi"
        description="Quản lý khuyến mãi và mã giảm giá"
        action={
          <Link href="/admin/promotions/new">
            <Button type="primary">Tạo khuyến mãi</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên khuyến mãi"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 240 }}
        />
        <Select<PromotionStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 180 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách khuyến mãi" onRetry={() => void refetch()} />
      ) : (
        <PromotionTable
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

export default function AdminPromotionsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <PromotionsPageContent />
    </Suspense>
  );
}
