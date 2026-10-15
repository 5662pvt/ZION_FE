"use client";

import { Button, Space } from "antd";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import QuantityStepper from "@/components/ui/QuantityStepper";

interface AddToCartButtonProps {
  quantity: number;
  onQuantityChange: (value: number) => void;
  max?: number;
  outOfStock?: boolean;
  isAdding: boolean;
  isBuyingNow: boolean;
  onAdd: () => void;
  onBuyNow: () => void;
}

export default function AddToCartButton({
  quantity,
  onQuantityChange,
  max,
  outOfStock = false,
  isAdding,
  isBuyingNow,
  onAdd,
  onBuyNow,
}: AddToCartButtonProps) {
  const busy = isAdding || isBuyingNow;

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <QuantityStepper min={1} max={max} value={quantity} onChange={onQuantityChange} disabled={outOfStock || busy} />
      <Space wrap>
        <Button
          type="primary"
          size="large"
          icon={<FiShoppingCart aria-hidden />}
          disabled={outOfStock || busy}
          loading={isAdding}
          onClick={onAdd}
        >
          Thêm vào giỏ
        </Button>
        <Button
          size="large"
          icon={<FiZap aria-hidden />}
          disabled={outOfStock || busy}
          loading={isBuyingNow}
          onClick={onBuyNow}
        >
          Mua ngay
        </Button>
      </Space>
    </Space>
  );
}
