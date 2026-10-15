"use client";

import Link from "next/link";
import { Flex, Typography } from "antd";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/shop/product/ProductGrid";
import type { CategoryTreeNodeDto } from "@/types/categories";

const { Title } = Typography;

export default function CategorySection({ category }: { category: CategoryTreeNodeDto }) {
  const { data, isLoading, isError, refetch } = useProducts({ categoryId: category.id, page: 1, pageSize: 4 });

  if (!isLoading && !isError && (!data || data.items.length === 0)) return null;

  return (
    <section>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          {category.name}
        </Title>
        <Link href={`/products?categoryId=${category.id}`}>Xem tất cả</Link>
      </Flex>
      <ProductGrid items={data?.items ?? []} loading={isLoading} isError={isError} onRetry={() => refetch()} skeletonCount={4} />
    </section>
  );
}
