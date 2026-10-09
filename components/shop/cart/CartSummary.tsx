"use client";

import Link from "next/link";
import { Button, Card, Popconfirm, Space, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useClearCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { cartSubtotal } from "@/utils/cartTotals";
import type { CartDto } from "@/types/cart";

const { Text, Title } = Typography;

interface CartSummaryProps {
  cart: CartDto;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const clearCart = useClearCart();
  const { isAuthenticated } = useAuth();
  const subtotal = cartSubtotal(cart);
  const checkoutHref = isAuthenticated ? "/checkout" : "/login?returnUrl=/checkout";

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
        <Link href={checkoutHref}>
          <Button type="primary" block>
            Thanh toán
          </Button>
        </Link>
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
