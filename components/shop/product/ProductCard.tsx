import type { MouseEvent } from "react";
import Link from "next/link";
import { Button, Card, Image } from "antd";
import { FiShoppingCart } from "react-icons/fi";
import StarRating from "@/components/shop/reviews/StarRating";
import WishlistButton from "@/components/shop/product/WishlistButton";
import Price from "@/components/ui/Price";
import { StockLevelBadge } from "@/components/ui/StatusBadge";
import { useAddToCart } from "@/hooks/useCart";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import type { ProductSummaryDto } from "@/types/products";

interface ProductCardProps {
  product: ProductSummaryDto;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({ product, inStock, rating, reviewCount }: ProductCardProps) {
  const outOfStock = inStock === false;
  const addToCart = useAddToCart();

  function handleQuickAdd(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => toast.success("Đã thêm vào giỏ"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại"),
      }
    );
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        hoverable
        styles={{ body: { padding: 12 } }}
        cover={
          <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "var(--color-border)" }}>
            {product.primaryImageUrl && (
              <Image
                src={product.primaryImageUrl}
                alt={product.name}
                preview={false}
                wrapperStyle={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: outOfStock ? "grayscale(1) opacity(0.6)" : undefined,
                }}
              />
            )}
            {inStock !== undefined && (
              <div style={{ position: "absolute", top: 8, left: 8 }}>
                <StockLevelBadge level={outOfStock ? "OutOfStock" : "InStock"} />
              </div>
            )}
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <WishlistButton productId={product.id} size="small" />
            </div>
            <Button
              shape="circle"
              icon={<FiShoppingCart aria-hidden />}
              aria-label={`Thêm ${product.name} vào giỏ`}
              disabled={outOfStock}
              loading={addToCart.isPending}
              onClick={handleQuickAdd}
              style={{ position: "absolute", bottom: 8, right: 8, width: 36, height: 36, boxShadow: "var(--shadow-card)" }}
            />
          </div>
        }
      >
        <Card.Meta
          title={
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                whiteSpace: "normal",
                lineHeight: 1.25,
                minHeight: 40,
              }}
            >
              {product.name}
            </span>
          }
          description={
            <>
              <Price value={product.price} />
              {!!reviewCount && (
                <div style={{ marginTop: 4 }}>
                  <StarRating value={rating ?? 0} fontSize={12} />
                  <span style={{ marginLeft: 4, color: "var(--color-muted)" }}>({reviewCount})</span>
                </div>
              )}
            </>
          }
        />
      </Card>
    </Link>
  );
}
