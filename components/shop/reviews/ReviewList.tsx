"use client";

import dayjs from "dayjs";
import { Empty, Pagination, Spin, Tag, Typography } from "antd";
import StarRating from "./StarRating";
import type { ReviewDto } from "@/types/reviews";

const { Text, Paragraph } = Typography;

interface ReviewListProps {
  items: ReviewDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number) => void;
}

export default function ReviewList({ items, loading, pagination, onPageChange }: ReviewListProps) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (items.length === 0) {
    return <Empty description="Chưa có đánh giá nào" />;
  }

  return (
    <div>
      {items.map((review) => (
        <div key={review.id} style={{ borderBottom: "1px solid #f0f0f0", padding: "16px 0" }}>
          <StarRating value={review.rating} allowHalf={false} fontSize={14} />
          <div style={{ margin: "4px 0" }}>
            <Text strong>{review.authorName}</Text>
            {review.isVerifiedPurchase && (
              <Tag color="green" style={{ marginLeft: 8 }}>
                Đã mua hàng
              </Tag>
            )}
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {dayjs(review.createdAt).format("DD/MM/YYYY")}
            </Text>
          </div>
          {review.title && (
            <Text strong style={{ display: "block" }}>
              {review.title}
            </Text>
          )}
          <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{review.content}</Paragraph>
        </div>
      ))}
      <Pagination
        style={{ marginTop: 16, textAlign: "center" }}
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger={false}
        onChange={onPageChange}
      />
    </div>
  );
}
