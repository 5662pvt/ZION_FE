"use client";

import { Button } from "antd";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({ productId, disabled = true }: AddToCartButtonProps) {
  void productId;

  return (
    <Button type="primary" disabled={disabled}>
      Thêm vào giỏ
    </Button>
  );
}
