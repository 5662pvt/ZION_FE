"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Drawer, Flex, Input, Select, Spin, Tag, Typography } from "antd";
import { FiFilter } from "react-icons/fi";
import ProductFilters, { SORT_OPTIONS, type ProductFiltersValue } from "@/components/shop/product/ProductFilters";
import ProductGrid from "@/components/shop/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCategories";
import { formatVnd } from "@/utils/money";
import type { ProductListParams } from "@/types/products";
import type { CategoryTreeNodeDto } from "@/types/categories";

const { Title, Text } = Typography;

function findCategoryName(nodes: CategoryTreeNodeDto[], id: string): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.name;
    const found = findCategoryName(node.children, id);
    if (found) return found;
  }
  return undefined;
}

function subscribeToMobileViewport(callback: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 639px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsMobileViewport() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function getIsMobileViewportServerSnapshot() {
  return false;
}

function useIsMobileViewport() {
  return useSyncExternalStore(subscribeToMobileViewport, getIsMobileViewport, getIsMobileViewportServerSnapshot);
}

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobileViewport();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ProductFiltersValue>({});

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const keyword = searchParams.get("keyword") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const filters: ProductFiltersValue = { categoryId, minPrice, maxPrice };
  const params: ProductListParams = { page, pageSize, keyword, categoryId, minPrice, maxPrice, sort };
  const { data, isLoading, isError, refetch } = useProducts(params);
  const { data: categoryTree } = useCategoryTree();

  function updateParams(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    if (!("page" in next)) sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  function applyFilters(next: ProductFiltersValue) {
    updateParams({
      categoryId: next.categoryId,
      minPrice: next.minPrice?.toString(),
      maxPrice: next.maxPrice?.toString(),
    });
  }

  function openDrawer() {
    setDraftFilters(filters);
    setDrawerOpen(true);
  }

  function handleDrawerApply() {
    applyFilters(draftFilters);
    setDrawerOpen(false);
  }

  function clearAllFilters() {
    router.push(pathname);
  }

  const categoryName = categoryId && categoryTree ? findCategoryName(categoryTree, categoryId) : undefined;
  const priceLabel =
    minPrice !== undefined || maxPrice !== undefined
      ? `Giá: ${minPrice !== undefined ? formatVnd(minPrice) : "0"} - ${maxPrice !== undefined ? formatVnd(maxPrice) : "∞"}`
      : undefined;

  return (
    <div className="products-page">
      <Title level={2}>Sản phẩm</Title>

      <Input.Search
        allowClear
        placeholder="Tìm sản phẩm..."
        defaultValue={keyword}
        onSearch={(value) => updateParams({ keyword: value || undefined })}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />

      {(categoryName || priceLabel) && (
        <Flex gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
          {categoryName && (
            <Tag
              closable
              onClose={(e) => {
                e.preventDefault();
                applyFilters({ ...filters, categoryId: undefined });
              }}
            >
              {categoryName}
            </Tag>
          )}
          {priceLabel && (
            <Tag
              closable
              onClose={(e) => {
                e.preventDefault();
                applyFilters({ ...filters, minPrice: undefined, maxPrice: undefined });
              }}
            >
              {priceLabel}
            </Tag>
          )}
        </Flex>
      )}

      <div className="products-layout">
        <aside className="products-sidebar">
          <ProductFilters value={filters} onChange={(next) => applyFilters({ ...filters, ...next })} />
        </aside>

        <div className="products-main">
          <Flex align="center" justify="space-between" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
            <Text type="secondary">{isLoading ? "Đang tải..." : `${data?.pagination.totalCount ?? 0} sản phẩm`}</Text>
            <Flex align="center" gap={8}>
              <Button className="products-filter-trigger" icon={<FiFilter aria-hidden />} onClick={openDrawer}>
                Bộ lọc
              </Button>
              <Select
                style={{ width: 180 }}
                options={SORT_OPTIONS}
                value={sort ?? ""}
                onChange={(value) => updateParams({ sort: value || undefined })}
              />
            </Flex>
          </Flex>

          <ProductGrid
            items={data?.items ?? []}
            loading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyMessage="Không tìm thấy sản phẩm"
            emptyAction={{ label: "Xoá bộ lọc", onClick: clearAllFilters }}
            pagination={{
              current: data?.pagination.page ?? page,
              pageSize: data?.pagination.pageSize ?? pageSize,
              total: data?.pagination.totalCount ?? 0,
              onChange: (p, ps) => updateParams({ page: String(p), pageSize: String(ps) }),
            }}
          />
        </div>
      </div>

      <Drawer
        title="Bộ lọc"
        placement={isMobile ? "bottom" : "right"}
        height={isMobile ? "80vh" : undefined}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <Flex justify="space-between">
            <Button onClick={() => setDraftFilters({})}>Xoá lọc</Button>
            <Button type="primary" onClick={handleDrawerApply}>
              Áp dụng
            </Button>
          </Flex>
        }
      >
        <ProductFilters value={draftFilters} onChange={(next) => setDraftFilters((prev) => ({ ...prev, ...next }))} />
      </Drawer>

      <style jsx>{`
        .products-page {
          max-width: var(--content-max);
          margin: 0 auto;
          padding: 16px;
        }
        .products-layout {
          display: flex;
          gap: 24px;
        }
        .products-sidebar {
          display: none;
        }
        .products-main {
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 640px) {
          .products-page {
            padding: 24px;
          }
        }
        @media (min-width: 1024px) {
          .products-sidebar {
            display: block;
            width: 240px;
            flex-shrink: 0;
          }
          .products-filter-trigger {
            display: none;
          }
        }
      `}</style>
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
