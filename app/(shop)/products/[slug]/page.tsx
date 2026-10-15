"use client";

import { use } from "react";
import Link from "next/link";
import { Button, Col, Result, Row, Skeleton } from "antd";
import Breadcrumbs from "@/components/shop/layout/Breadcrumbs";
import ProductGallery from "@/components/shop/product/ProductGallery";
import ProductDetail from "@/components/shop/product/ProductDetail";
import ErrorState from "@/components/ui/ErrorState";
import { useProductBySlug } from "@/hooks/useProducts";
import { ApiError } from "@/services/apiClient";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError, error, refetch } = useProductBySlug(slug);

  if (isLoading) {
    return (
      <div className="pdp-container">
        <Skeleton active paragraph={false} title={{ width: 240 }} style={{ marginBottom: 24 }} />
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Skeleton.Image active style={{ width: "100%", height: 400 }} />
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active title={{ width: "70%" }} paragraph={{ rows: 2, width: ["40%", "30%"] }} />
            <Skeleton.Button active size="large" style={{ width: 160, marginTop: 16 }} />
            <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 24 }} />
          </Col>
        </Row>
        <style>{`
          .pdp-container { max-width: var(--content-max); margin: 0 auto; padding: 16px; }
          @media (min-width: 640px) { .pdp-container { padding: 24px; } }
        `}</style>
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
      <div className="pdp-container">
        <ErrorState message="Không tải được thông tin sản phẩm" onRetry={() => refetch()} />
        <style>{`
          .pdp-container { max-width: var(--content-max); margin: 0 auto; padding: 16px; }
          @media (min-width: 640px) { .pdp-container { padding: 24px; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pdp-container">
      <Breadcrumbs
        items={[
          ...(product.categoryName
            ? [{ label: product.categoryName, href: `/products?categoryId=${product.categoryId}` }]
            : []),
          { label: product.name },
        ]}
      />
      <Row gutter={32}>
        <Col xs={24} md={12}>
          <ProductGallery images={product.images} name={product.name} />
        </Col>
        <Col xs={24} md={12}>
          <ProductDetail product={product} />
        </Col>
      </Row>
      <style>{`
        .pdp-container { max-width: var(--content-max); margin: 0 auto; padding: 16px; }
        @media (min-width: 640px) { .pdp-container { padding: 24px; } }
      `}</style>
    </div>
  );
}
