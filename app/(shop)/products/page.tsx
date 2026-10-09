"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Spin, Typography } from "antd";
import ProductFilters, { type ProductFiltersValue } from "@/components/shop/product/ProductFilters";
import ProductGrid from "@/components/shop/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import type { ProductListParams } from "@/types/products";

const { Title } = Typography;

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const keyword = searchParams.get("keyword") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const params: ProductListParams = { page, pageSize, keyword, categoryId, minPrice, maxPrice, sort };
  const { data, isLoading, isError } = useProducts(params);

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function handleFiltersChange(next: Partial<ProductFiltersValue>) {
    updateParams({
      categoryId: "categoryId" in next ? next.categoryId : categoryId,
      minPrice: "minPrice" in next ? next.minPrice?.toString() : minPrice?.toString(),
      maxPrice: "maxPrice" in next ? next.maxPrice?.toString() : maxPrice?.toString(),
      sort: "sort" in next ? next.sort : sort,
    });
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Title level={2}>Sản phẩm</Title>
      <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Input.Search
          allowClear
          placeholder="Tìm sản phẩm..."
          defaultValue={keyword}
          onSearch={(value) => updateParams({ keyword: value || undefined })}
          style={{ width: 260 }}
        />
        <ProductFilters value={{ categoryId, minPrice, maxPrice, sort }} onChange={handleFiltersChange} />
      </div>

      <ProductGrid
        items={data?.items ?? []}
        loading={isLoading}
        isError={isError}
        pagination={{
          current: data?.pagination.page ?? page,
          pageSize: data?.pagination.pageSize ?? pageSize,
          total: data?.pagination.totalCount ?? 0,
        }}
        onPageChange={(p, ps) => updateParams({ page: String(p), pageSize: String(ps) })}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <ProductsPageContent />
    </Suspense>
  );
}
