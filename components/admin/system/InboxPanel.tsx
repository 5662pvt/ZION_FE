"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "antd";
import { useInboxList, useSystemModules } from "@/hooks/useSystem";
import FilterBar from "@/components/admin/common/FilterBar";
import ErrorState from "@/components/ui/ErrorState";
import InboxTable from "./InboxTable";

export default function InboxPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("ibPage") ?? 1);
  const pageSize = Number(searchParams.get("ibPageSize") ?? 20);
  const moduleFilter = searchParams.get("ibModule") ?? undefined;

  const { data: modules } = useSystemModules();
  const { data, isLoading, isError, refetch } = useInboxList({ module: moduleFilter, page, pageSize });

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("ibPage" in next)) sp.set("ibPage", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  const moduleOptions = (modules?.inbox ?? []).map((name) => ({ value: name, label: name }));

  return (
    <div>
      <FilterBar>
        <Select
          allowClear
          placeholder="Module"
          style={{ width: 200 }}
          value={moduleFilter}
          options={moduleOptions}
          onChange={(value) => updateParams({ ibModule: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách inbox" onRetry={() => void refetch()} />
      ) : (
        <InboxTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ ibPage: String(p), ibPageSize: String(ps) })}
        />
      )}
    </div>
  );
}
