"use client";

import { use } from "react";
import Link from "next/link";
import { Alert, Button, Col, Result, Row, Spin } from "antd";
import ProductGallery from "@/components/shop/product/ProductGallery";
import ProductDetail from "@/components/shop/product/ProductDetail";
import { useProductBySlug } from "@/hooks/useProducts";
import { ApiError } from "@/services/apiClient";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError, error } = useProductBySlug(slug);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Result
        status="404"
        title="Sản phẩm không tồn tại"
        subTitle="Sản phẩm bạn tìm không tồn tại hoặc đã bị gỡ."
        extra={
          <Link href="/products">
            <Button type="primary">Về trang sản phẩm</Button>
          </Link>
        }
      />
    );
  }

  if (isError || !product) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <Alert type="error" message="Không tải được thông tin sản phẩm" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Row gutter={32}>
        <Col xs={24} md={12}>
          <ProductGallery images={product.images} name={product.name} />
        </Col>
        <Col xs={24} md={12}>
          <ProductDetail product={product} />
        </Col>
      </Row>
    </div>
  );
}
