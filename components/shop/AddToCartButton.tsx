"use client";

import { Button, Space, Typography } from "antd";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import QuantityStepper from "@/components/ui/QuantityStepper";

const { Text } = Typography;

interface AddToCartButtonProps {
  quantity: number;
  onQuantityChange: (value: number) => void;
  max?: number;
  outOfStock?: boolean;
  needsSelection?: boolean;
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
  needsSelection = false,
  isAdding,
  isBuyingNow,
  onAdd,
  onBuyNow,
}: AddToCartButtonProps) {
  const busy = isAdding || isBuyingNow;
  const blocked = outOfStock || needsSelection || busy;

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <QuantityStepper min={1} max={max} value={quantity} onChange={onQuantityChange} disabled={outOfStock || busy} />
      <Space wrap>
        <Button
          type="primary"
          size="large"
          icon={<FiShoppingCart aria-hidden />}
          disabled={blocked}
          loading={isAdding}
          onClick={onAdd}
        >
          Thêm vào giỏ
        </Button>
        <Button size="large" icon={<FiZap aria-hidden />} disabled={blocked} loading={isBuyingNow} onClick={onBuyNow}>
          Mua ngay
        </Button>
      </Space>
      {needsSelection && <Text type="warning">Vui lòng chọn phân loại</Text>}
    </Space>
  );
}
