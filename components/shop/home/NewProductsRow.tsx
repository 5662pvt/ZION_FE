"use client";

import { Typography } from "antd";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/shop/product/ProductGrid";

const { Title } = Typography;

export default function NewProductsRow() {
  const { data, isLoading, isError, refetch } = useProducts({ page: 1, pageSize: 8, sort: "newest" });

  return (
    <section>
      <Title level={3} style={{ marginBottom: 16 }}>
        Sản phẩm mới
      </Title>
      <ProductGrid
        items={data?.items ?? []}
        loading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="Chưa có sản phẩm nào."
        skeletonCount={8}
      />
    </section>
  );
}
