import { Button, Pagination } from "antd";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useProductAvailabilitySummary } from "@/hooks/useAvailability";
import { useReviewSummaries } from "@/hooks/useReviews";
import type { ProductSummaryDto } from "@/types/products";

interface ProductGridPagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

interface ProductGridEmptyAction {
  label: string;
  onClick: () => void;
}

interface ProductGridProps {
  items: ProductSummaryDto[];
  loading: boolean;
  isError: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: ProductGridEmptyAction;
  skeletonCount?: number;
  pagination?: ProductGridPagination;
}

export default function ProductGrid({
  items,
  loading,
  isError,
  onRetry,
  emptyMessage = "Không tìm thấy sản phẩm",
  emptyAction,
  skeletonCount = 8,
  pagination,
}: ProductGridProps) {
  const ids = items.map((item) => item.id);
  const { data: availability } = useProductAvailabilitySummary(ids);
  const { data: reviewSummaries } = useReviewSummaries(ids);

  if (isError) {
    return <ErrorState message="Không tải được danh sách sản phẩm" onRetry={onRetry} />;
  }

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        description={emptyMessage}
        action={emptyAction && <Button onClick={emptyAction.onClick}>{emptyAction.label}</Button>}
      />
    );
  }

  return (
    <>
      <div className="product-grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, index) => <ProductCardSkeleton key={index} />)
          : items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inStock={availability?.[product.id]?.inStock}
                rating={reviewSummaries?.[product.id]?.average}
                reviewCount={reviewSummaries?.[product.id]?.count}
              />
            ))}
      </div>
      {!loading && pagination && (
        <Pagination
          style={{ marginTop: 24, textAlign: "center" }}
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          onChange={pagination.onChange}
        />
      )}
      <style jsx>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        :global(.product-grid > *) {
          min-width: 0;
        }
        @media (min-width: 640px) {
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}
