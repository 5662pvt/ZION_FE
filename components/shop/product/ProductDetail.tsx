"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Space, Typography } from "antd";
import { FiMessageCircle, FiRefreshCw, FiTruck } from "react-icons/fi";
import AddToCartButton from "@/components/shop/AddToCartButton";
import StickyBuyBar from "@/components/shop/product/StickyBuyBar";
import VariantSelector from "@/components/shop/product/VariantSelector";
import ProductTabs from "@/components/shop/product/ProductTabs";
import WishlistButton from "@/components/shop/product/WishlistButton";
import { openChatWidget } from "@/hooks/useChatWidgetStore";
import { useAddToCart } from "@/hooks/useCart";
import { useProductAvailability, useVariantAvailability } from "@/hooks/useAvailability";
import { useActiveFlashSaleForProduct, useActiveFlashSaleForVariant } from "@/hooks/useFlashSales";
import FlashSaleCountdown from "@/components/shop/home/FlashSaleCountdown";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import { formatVnd } from "@/utils/money";
import Price from "@/components/ui/Price";
import { StatusBadge, StockLevelBadge } from "@/components/ui/StatusBadge";
import type { ProductDto, ProductVariantDto } from "@/types/products";

const { Title, Text } = Typography;

interface ProductDetailProps {
  product: ProductDto;
  onVariantImageChange?: (imageUrl: string | null) => void;
}

function variantFromSelection(product: ProductDto, selected: (string | null)[]): ProductVariantDto | undefined {
  return product.variants.find(
    (v) =>
      v.isActive &&
      v.option1Value === selected[0] &&
      (product.options.length < 2 || v.option2Value === selected[1])
  );
}

export default function ProductDetail({ product, onVariantImageChange }: ProductDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasOptions = product.options.length > 0;

  const [selected, setSelected] = useState<(string | null)[]>(() => {
    if (!hasOptions) return [];
    const fromQuery = product.variants.find((v) => v.id === searchParams.get("variant") && v.isActive);
    return product.options.map((_, index) => (fromQuery ? (index === 0 ? fromQuery.option1Value : fromQuery.option2Value) : null));
  });

  const selectedVariant = hasOptions ? variantFromSelection(product, selected) : product.variants[0];
  const allOptionsSelected = hasOptions ? selected.every((value) => !!value) : true;
  const needsSelection = hasOptions && !(allOptionsSelected && selectedVariant);

  useEffect(() => {
    onVariantImageChange?.(selectedVariant?.imageUrl ?? null);
  }, [selectedVariant?.imageUrl, onVariantImageChange]);

  useEffect(() => {
    if (!hasOptions) return;
    const sp = new URLSearchParams(searchParams.toString());
    const current = sp.get("variant");
    const next = selectedVariant?.id ?? null;
    if (current === next) return;
    if (next) sp.set("variant", next);
    else sp.delete("variant");
    const qs = sp.toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  const variantIds = useMemo(() => product.variants.map((v) => v.id), [product.variants]);
  const { data: variantAvailability } = useVariantAvailability(hasOptions ? variantIds : []);
  const { data: singleAvailability } = useProductAvailability(hasOptions ? "" : product.id);

  const { item: flashSaleItemByProduct } = useActiveFlashSaleForProduct(hasOptions ? "" : product.id);
  const { item: flashSaleItemByVariant } = useActiveFlashSaleForVariant(hasOptions && selectedVariant ? selectedVariant.id : "");
  const flashSaleItem = hasOptions ? flashSaleItemByVariant : flashSaleItemByProduct;

  const availability = hasOptions ? (selectedVariant ? variantAvailability?.[selectedVariant.id] : undefined) : singleAvailability;

  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [intent, setIntent] = useState<"idle" | "add" | "buyNow">("idle");

  const inStock = availability?.inStock;
  const available = availability?.available;
  const outOfStock = inStock === false;

  function handleSelectOption(optionIndex: number, value: string | null) {
    setSelected((prev) => {
      const next = [...prev];
      next[optionIndex] = value;
      return next;
    });
  }

  const availabilityKey = `${selectedVariant?.id ?? ""}|${available ?? ""}`;
  const [prevAvailabilityKey, setPrevAvailabilityKey] = useState(availabilityKey);
  if (prevAvailabilityKey !== availabilityKey) {
    setPrevAvailabilityKey(availabilityKey);
    if (available !== undefined) {
      setQuantity((prev) => Math.min(prev, Math.max(available, 1)));
    }
  }

  function cartPayload() {
    return hasOptions && selectedVariant ? { variantId: selectedVariant.id, quantity } : { productId: product.id, quantity };
  }

  function handleAdd() {
    if (addToCart.isPending) return;
    if (needsSelection) {
      toast.error("Vui lòng chọn phân loại hàng");
      return;
    }
    setIntent("add");
    addToCart.mutate(cartPayload(), {
      onSuccess: () => toast.success("Đã thêm vào giỏ · Xem giỏ", { onClick: () => router.push("/cart") }),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại"),
      onSettled: () => setIntent("idle"),
    });
  }

  function handleBuyNow() {
    if (addToCart.isPending) return;
    if (needsSelection) {
      toast.error("Vui lòng chọn phân loại hàng");
      return;
    }
    setIntent("buyNow");
    addToCart.mutate(cartPayload(), {
      onSuccess: () => router.push("/checkout"),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại");
        setIntent("idle");
      },
    });
  }

  const isAdding = addToCart.isPending && intent === "add";
  const isBuyingNow = addToCart.isPending && intent === "buyNow";

  const skuToShow = hasOptions ? selectedVariant?.sku ?? null : product.sku;

  function handleChatNow() {
    openChatWidget({
      type: "Product",
      card: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        currency: product.currency,
        imageUrl: product.images[0]?.url ?? null,
      },
    });
  }

  return (
    <div>
      <Title level={1} style={{ fontSize: 24, marginBottom: 4 }}>
        {product.name}
      </Title>
      <Text type="secondary">Mã SP: {skuToShow ?? "—"}</Text>
      {product.brand && (
        <div>
          <Text type="secondary">Thương hiệu: {product.brand}</Text>
        </div>
      )}

      <div style={{ margin: "12px 0" }}>
        {flashSaleItem ? (
          <Space direction="vertical" size={4}>
            <Price value={flashSaleItem.flashPrice} oldValue={flashSaleItem.regularPrice} size="large" />
            <Space size={12}>
              <FlashSaleCountdown endsAt={flashSaleItem.flashSaleEndsAt} />
              <Text type="secondary">Còn {flashSaleItem.available} suất</Text>
            </Space>
          </Space>
        ) : needsSelection ? (
          product.minPrice === product.maxPrice ? (
            <Price value={product.minPrice} size="large" />
          ) : (
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text)" }}>
              {formatVnd(product.minPrice)} – {formatVnd(product.maxPrice)}
            </span>
          )
        ) : (
          <Price value={hasOptions && selectedVariant ? selectedVariant.price : product.price} size="large" />
        )}
      </div>

      {hasOptions && (
        <div style={{ marginBottom: 20 }}>
          <VariantSelector
            options={product.options}
            variants={product.variants}
            availability={variantAvailability}
            selected={selected}
            onChange={handleSelectOption}
          />
        </div>
      )}

      {!needsSelection && inStock !== undefined && (
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
        <Space align="start" size={12}>
          <AddToCartButton
            quantity={quantity}
            onQuantityChange={setQuantity}
            max={available}
            outOfStock={outOfStock}
            needsSelection={needsSelection}
            isAdding={isAdding}
            isBuyingNow={isBuyingNow}
            onAdd={handleAdd}
            onBuyNow={handleBuyNow}
          />
          <WishlistButton productId={product.id} size="large" />
          <Button size="large" icon={<FiMessageCircle aria-hidden />} onClick={handleChatNow}>
            Chat ngay
          </Button>
        </Space>
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
        needsSelection={needsSelection}
        isAdding={isAdding}
        isBuyingNow={isBuyingNow}
        onAdd={handleAdd}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
