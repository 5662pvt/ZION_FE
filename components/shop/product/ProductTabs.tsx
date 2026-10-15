"use client";

import { useEffect, useState } from "react";
import { Descriptions, Tabs, Typography } from "antd";
import ProductReviews from "@/components/shop/reviews/ProductReviews";
import { useReviewSummary } from "@/hooks/useReviews";
import type { ProductDto } from "@/types/products";

const { Paragraph, Text } = Typography;

interface ProductTabsProps {
  product: ProductDto;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const { data: summary } = useReviewSummary(product.id);
  const [activeKey, setActiveKey] = useState("description");

  useEffect(() => {
    if (window.location.hash === "#reviews") {
      // Syncing tab state from the URL hash on mount requires an effect; there is no render-time source for it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey("reviews");
      requestAnimationFrame(() => document.getElementById("reviews")?.scrollIntoView());
    }
  }, []);

  const specItems = [
    { key: "sku", label: "SKU", children: product.sku },
    ...(product.brand ? [{ key: "brand", label: "Thương hiệu", children: product.brand }] : []),
    ...(product.categoryName ? [{ key: "category", label: "Danh mục", children: product.categoryName }] : []),
  ];

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      items={[
        {
          key: "description",
          label: "Mô tả",
          children: product.description ? (
            <Paragraph style={{ whiteSpace: "pre-wrap" }}>{product.description}</Paragraph>
          ) : (
            <Text type="secondary">Chưa có mô tả cho sản phẩm này</Text>
          ),
        },
        {
          key: "specs",
          label: "Thông số",
          children: <Descriptions column={1} bordered size="small" items={specItems} />,
        },
        {
          key: "reviews",
          label: `Đánh giá (${summary?.count ?? 0})`,
          children: <ProductReviews productId={product.id} />,
        },
      ]}
    />
  );
}
