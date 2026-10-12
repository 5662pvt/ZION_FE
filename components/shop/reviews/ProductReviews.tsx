"use client";

import { useState } from "react";
import { Divider, Typography } from "antd";
import RatingSummary from "./RatingSummary";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { useProductReviews, useReviewSummary } from "@/hooks/useReviews";

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const { data: summary, isLoading: summaryLoading } = useReviewSummary(productId);
  const { data, isLoading, isError } = useProductReviews(productId, { page, pageSize: PAGE_SIZE, rating });

  function handleSelectRating(next: number | undefined) {
    setRating(next);
    setPage(1);
  }

  return (
    <section id="reviews" style={{ marginTop: 48 }}>
      <Title level={3}>Đánh giá sản phẩm</Title>
      <RatingSummary summary={summary} loading={summaryLoading} selectedRating={rating} onSelectRating={handleSelectRating} />
      <ReviewForm productId={productId} />
      <Divider />
      {isError ? (
        <Text type="danger">Không tải được đánh giá sản phẩm</Text>
      ) : (
        <ReviewList
          items={data?.items ?? []}
          loading={isLoading}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? PAGE_SIZE,
            total: data?.pagination.totalCount ?? 0,
          }}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
