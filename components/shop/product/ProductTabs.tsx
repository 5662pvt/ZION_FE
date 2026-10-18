"use client";

import { useEffect, useState } from "react";
import { Descriptions, Tabs, Typography } from "antd";
import ProductReviews from "@/components/shop/reviews/ProductReviews";
import ProductQA from "@/components/shop/product/ProductQA";
import { useReviewSummary } from "@/hooks/useReviews";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import type { ProductDto } from "@/types/products";

const { Paragraph, Text } = Typography;

interface ProductTabsProps {
  product: ProductDto;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const { data: summary } = useReviewSummary(product.id);
  const { data: questions } = useProductQuestions(product.id, { page: 1, pageSize: 10 });
  const [activeKey, setActiveKey] = useState("description");

  useEffect(() => {
    if (window.location.hash === "#reviews" || window.location.hash === "#qa") {
      const key = window.location.hash === "#qa" ? "qa" : "reviews";
      // Syncing tab state from the URL hash on mount requires an effect; there is no render-time source for it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey(key);
      requestAnimationFrame(() => document.getElementById(key)?.scrollIntoView());
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
        {
          key: "qa",
          label: `Hỏi đáp (${questions?.pagination.totalCount ?? 0})`,
          children: <ProductQA productId={product.id} />,
        },
      ]}
    />
  );
}
