"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Spin } from "antd";
import AdminReviewTable from "@/components/admin/reviews/AdminReviewTable";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { AdminReviewListParams, ReviewStatus } from "@/types/reviews";

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "Published", label: "Đã hiển thị" },
  { value: "Hidden", label: "Đã ẩn" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((value) => ({ value, label: `${value} sao` }));

function AdminReviewsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const status = (searchParams.get("status") as ReviewStatus | null) ?? undefined;
  const ratingRaw = searchParams.get("rating");
  const rating = ratingRaw ? Number(ratingRaw) : undefined;

  const params: AdminReviewListParams = { page, pageSize, keyword, status, rating };
  const { data, isLoading, isError, refetch } = useAdminReviews(params);

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
      <PageHeader title="Đánh giá sản phẩm" description="Kiểm duyệt đánh giá sản phẩm" />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Tên sản phẩm / tác giả / nội dung"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 280 }}
        />
        <Select<ReviewStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
        <Select<number | undefined>
          allowClear
          placeholder="Số sao"
          style={{ width: 140 }}
          value={rating}
          options={RATING_OPTIONS}
          onChange={(value) => updateParams({ rating: value ? String(value) : undefined })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách đánh giá" onRetry={() => void refetch()} />
      ) : (
        <AdminReviewTable
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

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <AdminReviewsPageContent />
    </Suspense>
  );
}
