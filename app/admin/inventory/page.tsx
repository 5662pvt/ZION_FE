"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Input, Space, Spin, Switch } from "antd";
import InventoryTable from "@/components/admin/inventory/InventoryTable";
import AdjustStockModal from "@/components/admin/inventory/AdjustStockModal";
import StockMovementsDrawer from "@/components/admin/inventory/StockMovementsDrawer";
import { useAdminInventory } from "@/hooks/useAdminInventory";
import type { InventoryItemDto, InventoryListParams } from "@/types/inventory";

function InventoryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";

  const params: InventoryListParams = { page, pageSize, keyword, lowStockOnly: lowStockOnly || undefined };
  const { data, isLoading, isError } = useAdminInventory(params);

  const [adjustItem, setAdjustItem] = useState<InventoryItemDto | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItemDto | null>(null);

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
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }} wrap>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Tìm theo SKU, tên sản phẩm"
            defaultValue={keyword}
            onSearch={(value) => updateParams({ keyword: value || undefined })}
            style={{ width: 260 }}
          />
          <Space>
            <Switch checked={lowStockOnly} onChange={(checked) => updateParams({ lowStockOnly: checked ? "true" : undefined })} />
            <span>Chỉ hiện tồn thấp</span>
          </Space>
        </Space>
      </Space>

      {isError ? (
        <Alert type="error" message="Không tải được dữ liệu tồn kho" />
      ) : (
        <InventoryTable
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
          onAdjust={(item) => setAdjustItem(item)}
          onViewHistory={(item) => setHistoryItem(item)}
        />
      )}

      <AdjustStockModal open={!!adjustItem} item={adjustItem} onClose={() => setAdjustItem(null)} />
      <StockMovementsDrawer open={!!historyItem} item={historyItem} onClose={() => setHistoryItem(null)} />
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <Suspense fallback={<Spin />}>
      <InventoryPageContent />
    </Suspense>
  );
}
