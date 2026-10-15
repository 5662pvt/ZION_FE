"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Space, Typography } from "antd";
import { FiRefreshCw, FiTruck } from "react-icons/fi";
import AddToCartButton from "@/components/shop/AddToCartButton";
import StickyBuyBar from "@/components/shop/product/StickyBuyBar";
import ProductTabs from "@/components/shop/product/ProductTabs";
import { useAddToCart } from "@/hooks/useCart";
import { useProductAvailability } from "@/hooks/useAvailability";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import Price from "@/components/ui/Price";
import { StatusBadge, StockLevelBadge } from "@/components/ui/StatusBadge";
import type { ProductDto } from "@/types/products";

const { Title, Text } = Typography;

interface ProductDetailProps {
  product: ProductDto;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { data: availability } = useProductAvailability(product.id);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [intent, setIntent] = useState<"idle" | "add" | "buyNow">("idle");

  const inStock = availability?.inStock;
  const available = availability?.available;
  const outOfStock = inStock === false;

  function handleAdd() {
    if (addToCart.isPending) return;
    setIntent("add");
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => toast.success("Đã thêm vào giỏ · Xem giỏ", { onClick: () => router.push("/cart") }),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại"),
        onSettled: () => setIntent("idle"),
      }
    );
  }

  function handleBuyNow() {
    if (addToCart.isPending) return;
    setIntent("buyNow");
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => router.push("/checkout"),
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại");
          setIntent("idle");
        },
      }
    );
  }

  const isAdding = addToCart.isPending && intent === "add";
  const isBuyingNow = addToCart.isPending && intent === "buyNow";

  return (
    <div>
      <Title level={1} style={{ fontSize: 24, marginBottom: 4 }}>
        {product.name}
      </Title>
      <Text type="secondary">Mã SP: {product.sku}</Text>
      {product.brand && (
        <div>
          <Text type="secondary">Thương hiệu: {product.brand}</Text>
        </div>
      )}

      <div style={{ margin: "12px 0" }}>
        <Price value={product.price} size="large" />
      </div>

      {inStock !== undefined && (
        <div style={{ marginBottom: 16 }}>
          {outOfStock ? (
            <StockLevelBadge level="OutOfStock" />
          ) : available !== undefined && available <= 5 ? (
            <StatusBadge color="var(--color-warning)">Chỉ còn {available} sản phẩm</StatusBadge>
          ) : (
            <StockLevelBadge level="InStock" />
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <AddToCartButton
          quantity={quantity}
          onQuantityChange={setQuantity}
          max={available}
          outOfStock={outOfStock}
          isAdding={isAdding}
          isBuyingNow={isBuyingNow}
          onAdd={handleAdd}
          onBuyNow={handleBuyNow}
        />
      </div>

      <Space direction="vertical" size={4} style={{ marginBottom: 32 }}>
        <Space size={8}>
          <FiTruck aria-hidden color="var(--color-muted)" />
          <Text type="secondary">Giao hàng toàn quốc</Text>
        </Space>
        <Space size={8}>
          <FiRefreshCw aria-hidden color="var(--color-muted)" />
          <Text type="secondary">Đổi trả trong 7 ngày</Text>
        </Space>
      </Space>

      <ProductTabs product={product} />

      <StickyBuyBar
        outOfStock={outOfStock}
        isAdding={isAdding}
        isBuyingNow={isBuyingNow}
        onAdd={handleAdd}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
