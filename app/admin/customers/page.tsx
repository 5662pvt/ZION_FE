"use client";

import { Suspense } from "react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Spin } from "antd";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import CustomerTable from "@/components/admin/customers/CustomerTable";
import CustomerDetailDrawer from "@/components/admin/customers/CustomerDetailDrawer";
import { useAdminCustomers, useLockCustomer, useUnlockCustomer } from "@/hooks/useAdminCustomers";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { AdminCustomerListParams, AdminCustomerStatusFilter, AdminCustomerSummaryDto } from "@/types/adminCustomers";

const ROLE_OPTIONS = [ROLES.Customer, ROLES.Staff, ROLES.Admin].map((value) => ({ value, label: value }));
const STATUS_OPTIONS: { value: AdminCustomerStatusFilter; label: string }[] = [
  { value: "Active", label: "Hoạt động" },
  { value: "Locked", label: "Đã khoá" },
];

function CustomersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [viewingId, setViewingId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const status = (searchParams.get("status") as AdminCustomerStatusFilter | null) ?? undefined;

  const params: AdminCustomerListParams = { page, pageSize, keyword, role, status };
  const { data, isLoading, isError, refetch } = useAdminCustomers(params);
  const lockCustomer = useLockCustomer();
  const unlockCustomer = useUnlockCustomer();

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleLock(record: AdminCustomerSummaryDto) {
    lockCustomer.mutate(record.id, {
      onSuccess: () => toast.success(`Đã khoá tài khoản ${record.email}`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Khoá tài khoản thất bại. Vui lòng thử lại."),
    });
  }

  function handleUnlock(record: AdminCustomerSummaryDto) {
    unlockCustomer.mutate(record.id, {
      onSuccess: () => toast.success(`Đã mở khoá tài khoản ${record.email}`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Mở khoá tài khoản thất bại. Vui lòng thử lại."),
    });
  }

  return (
    <div>
      <PageHeader title="Khách hàng" description="Quản lý tài khoản khách hàng, nhân viên và quản trị viên" />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Email / tên / SĐT"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 240 }}
        />
        <Select
          allowClear
          placeholder="Vai trò"
          style={{ width: 160 }}
          value={role}
          options={ROLE_OPTIONS}
          onChange={(value) => updateParams({ role: value })}
        />
        <Select<AdminCustomerStatusFilter | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách khách hàng" onRetry={() => void refetch()} />
      ) : (
        <CustomerTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
          onView={(record) => setViewingId(record.id)}
          onLock={handleLock}
          onUnlock={handleUnlock}
          currentUserId={user?.id}
          lockPending={lockCustomer.isPending}
          unlockPending={unlockCustomer.isPending}
        />
      )}

      <CustomerDetailDrawer open={!!viewingId} customerId={viewingId} onClose={() => setViewingId(null)} />
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<Spin />}>
      <CustomersPageContent />
    </Suspense>
  );
}
