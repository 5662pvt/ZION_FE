"use client";

import { Flex, Progress, Skeleton, Typography } from "antd";
import StarRating from "./StarRating";
import type { ReviewSummaryDto } from "@/types/reviews";

const { Title, Text } = Typography;

const STAR_VALUES = [5, 4, 3, 2, 1] as const;

interface RatingSummaryProps {
  summary?: ReviewSummaryDto;
  loading: boolean;
  selectedRating?: number;
  onSelectRating: (rating: number | undefined) => void;
}

export default function RatingSummary({ summary, loading, selectedRating, onSelectRating }: RatingSummaryProps) {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 24 }} />;
  }

  const average = summary?.average ?? 0;
  const count = summary?.count ?? 0;
  const distribution = summary?.distribution;

  return (
    <Flex gap={32} wrap="wrap" style={{ marginBottom: 24 }}>
      <Flex vertical align="center" justify="center" style={{ minWidth: 120 }}>
        <Title level={2} style={{ margin: 0 }}>
          {average.toFixed(1)}
        </Title>
        <StarRating value={average} />
        <Text type="secondary">{count} đánh giá</Text>
      </Flex>
      <Flex vertical gap={4} style={{ flex: 1, minWidth: 220 }}>
        {STAR_VALUES.map((star) => {
          const starCount = distribution?.[String(star) as keyof typeof distribution] ?? 0;
          const percent = count > 0 ? Math.round((starCount / count) * 100) : 0;
          const active = selectedRating === star;
          const clickable = starCount > 0;

          return (
            <Flex
              key={star}
              align="center"
              gap={8}
              style={{
                cursor: clickable ? "pointer" : "default",
                padding: "2px 6px",
                borderRadius: 4,
                background: active ? "var(--color-accent)" : undefined,
              }}
              onClick={() => clickable && onSelectRating(active ? undefined : star)}
            >
              <Text style={{ width: 44 }}>{star} sao</Text>
              <Progress percent={percent} showInfo={false} style={{ flex: 1 }} />
              <Text type="secondary" style={{ width: 32, textAlign: "right" }}>
                {starCount}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
