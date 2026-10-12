import { Alert, Col, Empty, Pagination, Row, Spin } from "antd";
import ProductCard from "./ProductCard";
import { useAvailabilityBatch } from "@/hooks/useAvailability";
import { useReviewSummaries } from "@/hooks/useReviews";
import type { ProductSummaryDto } from "@/types/products";

interface ProductGridProps {
  items: ProductSummaryDto[];
  loading: boolean;
  isError: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function ProductGrid({ items, loading, isError, pagination, onPageChange }: ProductGridProps) {
  const { data: availability } = useAvailabilityBatch(items.map((item) => item.id));
  const { data: reviewSummaries } = useReviewSummaries(items.map((item) => item.id));

  if (isError) {
    return <Alert type="error" message="Không tải được danh sách sản phẩm" />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return <Empty description="Không tìm thấy sản phẩm" />;
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {items.map((product) => (
          <Col key={product.id} xs={12} sm={8} md={6}>
            <ProductCard
              product={product}
              inStock={availability?.[product.id]?.inStock}
              rating={reviewSummaries?.[product.id]?.average}
              reviewCount={reviewSummaries?.[product.id]?.count}
            />
          </Col>
        ))}
      </Row>
      <Pagination
        style={{ marginTop: 24, textAlign: "center" }}
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger
        onChange={onPageChange}
      />
    </>
  );
}
