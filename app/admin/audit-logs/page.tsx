"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { DatePicker, Input, Select, Spin } from "antd";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import AuditLogTable from "@/components/admin/audit-logs/AuditLogTable";
import AuditLogDetailDrawer from "@/components/admin/audit-logs/AuditLogDetailDrawer";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import type { AuditAction, AuditLogDto, AuditLogListParams } from "@/types/auditLogs";

const { RangePicker } = DatePicker;

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: "Order.Cancel", label: "Huỷ đơn hàng" },
  { value: "Order.Ship", label: "Giao đơn hàng" },
  { value: "Order.Complete", label: "Hoàn tất đơn hàng" },
  { value: "Inventory.Adjust", label: "Điều chỉnh tồn kho" },
  { value: "Product.Create", label: "Tạo sản phẩm" },
  { value: "Product.Update", label: "Sửa sản phẩm" },
  { value: "Product.Archive", label: "Lưu trữ sản phẩm" },
  { value: "Product.Publish", label: "Xuất bản sản phẩm" },
  { value: "Product.ImageAdd", label: "Thêm ảnh sản phẩm" },
  { value: "Product.ImageRemove", label: "Xoá ảnh sản phẩm" },
  { value: "Product.ImageReorder", label: "Sắp xếp ảnh sản phẩm" },
  { value: "Category.Create", label: "Tạo danh mục" },
  { value: "Category.Update", label: "Sửa danh mục" },
  { value: "Category.Delete", label: "Xoá danh mục" },
  { value: "Promotion.Create", label: "Tạo khuyến mãi" },
  { value: "Promotion.Update", label: "Sửa khuyến mãi" },
  { value: "Promotion.Activate", label: "Kích hoạt khuyến mãi" },
  { value: "Promotion.Deactivate", label: "Tạm tắt khuyến mãi" },
  { value: "Coupon.Create", label: "Tạo mã giảm giá" },
  { value: "Coupon.Generate", label: "Sinh mã giảm giá" },
  { value: "Coupon.Deactivate", label: "Vô hiệu mã giảm giá" },
  { value: "Review.Hide", label: "Ẩn đánh giá" },
  { value: "Review.Show", label: "Hiện đánh giá" },
  { value: "Customer.Lock", label: "Khoá khách hàng" },
  { value: "Customer.Unlock", label: "Mở khoá khách hàng" },
  { value: "System.OutboxRetry", label: "Thử lại outbox" },
  { value: "System.OutboxRetryFailed", label: "Thử lại outbox lỗi" },
  { value: "System.DlqRequeue", label: "Đẩy lại DLQ" },
  { value: "System.DlqDelete", label: "Xoá thông báo DLQ" },
];

const DATE_FORMAT = "YYYY-MM-DD";

function AuditLogsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewing, setViewing] = useState<AuditLogDto | null>(null);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const actor = searchParams.get("actor") ?? undefined;
  const action = (searchParams.get("action") as AuditAction | null) ?? undefined;
  const resourceType = searchParams.get("resourceType") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const params: AuditLogListParams = { page, pageSize, actor, action, resourceType, from, to };
  const { data, isLoading, isError, refetch } = useAuditLogs(params);

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
      <PageHeader title="Nhật ký thao tác" description="Theo dõi các thao tác quản trị đã thực hiện trên hệ thống" />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Email người thực hiện"
          defaultValue={actor}
          onSearch={(value) => updateParams({ actor: value || undefined })}
          style={{ width: 220 }}
        />
        <Select<AuditAction | undefined>
          allowClear
          showSearch
          placeholder="Hành động"
          style={{ width: 200 }}
          value={action}
          options={ACTION_OPTIONS}
          optionFilterProp="label"
          onChange={(value) => updateParams({ action: value })}
        />
        <Input
          allowClear
          placeholder="Loại đối tượng"
          defaultValue={resourceType}
          style={{ width: 160 }}
          onPressEnter={(e) => updateParams({ resourceType: e.currentTarget.value || undefined })}
          onBlur={(e) => updateParams({ resourceType: e.currentTarget.value || undefined })}
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
        <ErrorState message="Không tải được nhật ký thao tác" onRetry={() => void refetch()} />
      ) : (
        <AuditLogTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
          onView={setViewing}
        />
      )}

      <AuditLogDetailDrawer open={!!viewing} record={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <AuditLogsPageContent />
    </Suspense>
  );
}
