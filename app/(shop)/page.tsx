"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Col, Flex, Input, Row, Spin, Typography } from "antd";
import { useCategoryTree } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useAvailabilityBatch } from "@/hooks/useAvailability";
import ProductCard from "@/components/shop/product/ProductCard";
import type { CategoryTreeNodeDto } from "@/types/categories";

const { Title } = Typography;

function NewProductsSection() {
  const { data, isLoading, isError } = useProducts({ page: 1, pageSize: 8, sort: "newest" });
  const { data: availability } = useAvailabilityBatch(data?.items.map((product) => product.id) ?? []);

  return (
    <section style={{ marginBottom: 48 }}>
      <Title level={3}>Sản phẩm mới</Title>
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <p>Không tải được sản phẩm mới.</p>
      ) : data && data.items.length > 0 ? (
        <Row gutter={[16, 16]}>
          {data.items.map((product) => (
            <Col key={product.id} xs={12} sm={8} md={6}>
              <ProductCard product={product} inStock={availability?.[product.id]?.inStock} />
            </Col>
          ))}
        </Row>
      ) : (
        <p>Chưa có sản phẩm nào.</p>
      )}
    </section>
  );
}

function CategorySection({ category }: { category: CategoryTreeNodeDto }) {
  const { data, isLoading, isError } = useProducts({ categoryId: category.id, page: 1, pageSize: 4 });
  const { data: availability } = useAvailabilityBatch(data?.items.map((product) => product.id) ?? []);

  if (!isLoading && !isError && (!data || data.items.length === 0)) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          {category.name}
        </Title>
        <Link href={`/products?categoryId=${category.id}`}>Xem tất cả</Link>
      </Flex>
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <p>Không tải được sản phẩm.</p>
      ) : (
        <Row gutter={[16, 16]}>
          {(data?.items ?? []).map((product) => (
            <Col key={product.id} xs={12} sm={8} md={6}>
              <ProductCard product={product} inStock={availability?.[product.id]?.inStock} />
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();

  function handleSearch(value: string) {
    const keyword = value.trim();
    router.push(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : "/products");
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
      <section
        style={{
          textAlign: "center",
          padding: "64px 24px",
          background: "#f0f5ff",
          borderRadius: 8,
          marginBottom: 48,
        }}
      >
        <Title level={1}>Chào mừng đến với ZIONShop</Title>
        <Input.Search
          placeholder="Tìm sản phẩm..."
          allowClear
          enterButton="Tìm kiếm"
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 480, margin: "24px auto 0" }}
        />
      </section>

      <NewProductsSection />

      {categoriesLoading ? (
        <Spin />
      ) : (
        (categories ?? []).map((category) => <CategorySection key={category.id} category={category} />)
      )}
    </div>
  );
}
