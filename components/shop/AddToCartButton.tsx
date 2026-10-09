"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputNumber, Space } from "antd";
import { FiShoppingCart } from "react-icons/fi";
import { useAddToCart } from "@/hooks/useCart";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  withQuantity?: boolean;
  block?: boolean;
}

export default function AddToCartButton({
  productId,
  disabled = false,
  withQuantity = false,
  block = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addToCart = useAddToCart();

  function handleAdd() {
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          toast.success("Đã thêm vào giỏ · Xem giỏ", { onClick: () => router.push("/cart") });
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Thêm vào giỏ thất bại");
        },
      }
    );
  }

  return (
    <Space.Compact block={block}>
      {withQuantity && (
        <InputNumber
          min={1}
          max={99}
          value={quantity}
          onChange={(value) => setQuantity(value ?? 1)}
          disabled={disabled || addToCart.isPending}
        />
      )}
      <Button
        type="primary"
        icon={<FiShoppingCart />}
        block={block && !withQuantity}
        disabled={disabled}
        loading={addToCart.isPending}
        onClick={handleAdd}
      >
        Thêm vào giỏ
      </Button>
    </Space.Compact>
  );
}
