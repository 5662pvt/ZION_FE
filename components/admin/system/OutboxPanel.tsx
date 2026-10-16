"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Popconfirm, Select } from "antd";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { useOutboxList, useRetryAllFailed, useSystemModules } from "@/hooks/useSystem";
import FilterBar from "@/components/admin/common/FilterBar";
import ErrorState from "@/components/ui/ErrorState";
import OutboxTable from "./OutboxTable";
import OutboxDetailDrawer from "./OutboxDetailDrawer";
import type { OutboxMessageSummaryDto, OutboxStatus } from "@/types/system";

const STATUS_OPTIONS: { value: OutboxStatus; label: string }[] = [
  { value: "Pending", label: "Đang chờ" },
  { value: "Failed", label: "Thất bại" },
  { value: "Processed", label: "Đã gửi" },
];

export default function OutboxPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewing, setViewing] = useState<OutboxMessageSummaryDto | null>(null);

  const page = Number(searchParams.get("obPage") ?? 1);
  const pageSize = Number(searchParams.get("obPageSize") ?? 20);
  const moduleFilter = searchParams.get("obModule") ?? undefined;
  const status = (searchParams.get("obStatus") as OutboxStatus | null) ?? undefined;

  const { data: modules } = useSystemModules();
  const { data, isLoading, isError, refetch } = useOutboxList({ module: moduleFilter, status, page, pageSize });
  const retryAllFailed = useRetryAllFailed();

  // Deep links (eg. from docs/alerts) use plain `status`/`module` params — alias them onto obStatus/obModule.
  useEffect(() => {
    const aliasStatus = searchParams.get("status");
    const aliasModule = searchParams.get("module");
    if (!aliasStatus && !aliasModule) return;

    const sp = new URLSearchParams(searchParams.toString());
    if (aliasStatus) {
      sp.delete("status");
      sp.set("obStatus", aliasStatus);
    }
    if (aliasModule) {
      sp.delete("module");
      sp.set("obModule", aliasModule);
    }
    if (!sp.has("obPage")) sp.set("obPage", "1");
    router.replace(`${pathname}?${sp.toString()}`);
  }, [searchParams, router, pathname]);

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("obPage" in next)) sp.set("obPage", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleRetryAllFailed() {
    retryAllFailed.mutate(moduleFilter, {
      onSuccess: (result) => toast.success(`Đã gửi lại ${result.retried} thông báo`),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi lại thất bại. Vui lòng thử lại."),
    });
  }

  const moduleOptions = (modules?.outbox ?? []).map((name) => ({ value: name, label: name }));

  return (
    <div>
      <FilterBar
        action={
          <Popconfirm title="Gửi lại tất cả thông báo thất bại?" onConfirm={handleRetryAllFailed}>
            <Button danger loading={retryAllFailed.isPending}>
              Gửi lại tất cả thất bại
            </Button>
          </Popconfirm>
        }
      >
        <Select
          allowClear
          placeholder="Module"
          style={{ width: 200 }}
          value={moduleFilter}
          options={moduleOptions}
          onChange={(value) => updateParams({ obModule: value })}
        />
        <Select<OutboxStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 180 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ obStatus: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách outbox" onRetry={() => void refetch()} />
      ) : (
        <OutboxTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ obPage: String(p), obPageSize: String(ps) })}
          onView={setViewing}
        />
      )}

      <OutboxDetailDrawer open={!!viewing} message={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
