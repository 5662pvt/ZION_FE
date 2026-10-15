"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Select, Spin, TreeSelect } from "antd";
import ProductTable from "@/components/admin/products/ProductTable";
import { mapCategoryTree } from "@/components/admin/products/categoryTreeData";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategoryTree } from "@/hooks/useCategories";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import FilterBar from "@/components/admin/common/FilterBar";
import type { AdminProductListParams, ProductStatus } from "@/types/products";

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "Draft", label: "Nháp" },
  { value: "Published", label: "Đã xuất bản" },
  { value: "Archived", label: "Lưu trữ" },
];

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const status = (searchParams.get("status") as ProductStatus | null) ?? undefined;

  const params: AdminProductListParams = { page, pageSize, keyword, categoryId, status };
  const { data, isLoading, isError, refetch } = useAdminProducts(params);
  const { data: categoryTree } = useCategoryTree();
  const treeData = mapCategoryTree(categoryTree ?? []);

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
        title="Sản phẩm"
        description="Quản lý danh sách sản phẩm trong cửa hàng"
        action={
          <Link href="/admin/products/new">
            <Button type="primary">Thêm sản phẩm</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên, SKU"
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 240 }}
        />
        <Select<ProductStatus | undefined>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => updateParams({ status: value })}
        />
        <TreeSelect
          allowClear
          placeholder="Danh mục"
          style={{ width: 220 }}
          treeData={treeData}
          value={categoryId}
          onChange={(value) => updateParams({ categoryId: value })}
        />
      </FilterBar>

      {isError ? (
        <ErrorState message="Không tải được danh sách sản phẩm" onRetry={() => void refetch()} />
      ) : (
        <ProductTable
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

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <ProductsPageContent />
    </Suspense>
  );
}
