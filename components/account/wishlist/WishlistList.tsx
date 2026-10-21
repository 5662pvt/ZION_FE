"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/shop/product/ProductGrid";
import PageHeader from "@/components/ui/PageHeader";
import { useWishlist } from "@/hooks/useWishlist";
import type { ProductSummaryDto } from "@/types/products";

export default function WishlistList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 12);

  const { data, isLoading, isError, refetch } = useWishlist({ page, pageSize });

  const items: ProductSummaryDto[] = (data?.items ?? []).map((item) => ({
    id: item.productId,
    name: item.name,
    slug: item.slug,
    sku: "",
    price: item.price,
    currency: item.currency,
    status: "Published",
    categoryName: null,
    primaryImageUrl: item.thumbnailUrl,
    minPrice: item.minPrice,
    maxPrice: item.maxPrice,
    variantCount: item.variantCount,
  }));

  function updatePage(nextPage: number, nextPageSize: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nextPage));
    sp.set("pageSize", String(nextPageSize));
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <>
      <PageHeader title="Sản phẩm yêu thích" />
      <ProductGrid
        items={items}
        loading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="Bạn chưa có sản phẩm yêu thích nào"
        emptyAction={{ label: "Khám phá sản phẩm", onClick: () => router.push("/products") }}
        pagination={
          data
            ? {
                current: data.pagination.page,
                pageSize: data.pagination.pageSize,
                total: data.pagination.totalCount,
                onChange: updatePage,
              }
            : undefined
        }
      />
    </>
  );
}
