"use client";

import Link from "next/link";
import { Button, Card, Popconfirm, Space, Tooltip, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useClearCart } from "@/hooks/useCart";
import { ApiError } from "@/services/apiClient";
import { cartSubtotal } from "@/utils/cartTotals";
import type { CartDto } from "@/types/cart";

const { Text, Title } = Typography;

interface CartSummaryProps {
  cart: CartDto;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const clearCart = useClearCart();
  const subtotal = cartSubtotal(cart);

  function handleClear() {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Đã xoá giỏ hàng"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá giỏ hàng thất bại"),
    });
  }

  return (
    <Card title="Tóm tắt đơn hàng">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text>Tạm tính</Text>
          <Title level={5} style={{ margin: 0 }}>
            {formatVnd(subtotal)}
          </Title>
        </Space>
        <Text type="secondary">Phí vận chuyển: tính khi thanh toán</Text>
        <Tooltip title="Sắp có">
          <span style={{ display: "block" }}>
            <Button type="primary" block disabled>
              Thanh toán
            </Button>
          </span>
        </Tooltip>
        <Popconfirm title="Xoá toàn bộ giỏ hàng?" onConfirm={handleClear}>
          <Button danger block loading={clearCart.isPending}>
            Xoá giỏ hàng
          </Button>
        </Popconfirm>
        <Link href="/products">
          <Button block>Tiếp tục mua sắm</Button>
        </Link>
      </Space>
    </Card>
  );
}
