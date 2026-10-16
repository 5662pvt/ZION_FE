"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Flex, List, Pagination, Skeleton, Typography } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { useMyReviews } from "@/hooks/useMyReviews";
import StarRating from "@/components/shop/reviews/StarRating";
import { ReviewStatusBadge } from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { ApiError } from "@/services/apiClient";
import type { MyReviewDto } from "@/types/reviews";

const { Text, Title } = Typography;

export default function MyReviewList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const { data, isLoading, isError, error, refetch } = useMyReviews({ page, pageSize });

  function updatePage(nextPage: number, nextPageSize: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nextPage));
    sp.set("pageSize", String(nextPageSize));
    router.push(`${pathname}?${sp.toString()}`);
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Đánh giá của tôi" />
        <ErrorState message={error instanceof ApiError ? error.message : undefined} onRetry={() => refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Đánh giá của tôi" />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState description="Bạn chưa có đánh giá nào" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={data?.items ?? []}
          renderItem={(item: MyReviewDto) => (
            <List.Item key={item.id}>
              <Flex justify="space-between" align="flex-start" wrap="wrap" gap={8}>
                <div>
                  {item.productSlug ? (
                    <Link href={`/products/${item.productSlug}`}>
                      <Text strong>{item.productName}</Text>
                    </Link>
                  ) : (
                    <Text strong>{item.productName}</Text>
                  )}
                  <div>
                    <StarRating value={item.rating} allowHalf={false} fontSize={14} />
                  </div>
                </div>
                <ReviewStatusBadge status={item.status} />
              </Flex>
              {item.title && (
                <Title level={5} style={{ margin: "8px 0 4px" }}>
                  {item.title}
                </Title>
              )}
              <Text>{item.content}</Text>
              {item.status === "Hidden" && item.hiddenReason && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">Lý do ẩn: {item.hiddenReason}</Text>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
      {!isLoading && (data?.pagination.totalCount ?? 0) > 0 && (
        <Flex justify="center" style={{ marginTop: 16 }}>
          <Pagination
            current={data?.pagination.page ?? page}
            pageSize={data?.pagination.pageSize ?? pageSize}
            total={data?.pagination.totalCount ?? 0}
            onChange={updatePage}
          />
        </Flex>
      )}
    </>
  );
}
