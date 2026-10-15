"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Collapse, Popconfirm, Space, Typography } from "antd";
import GiftPreview from "@/components/shop/gifts/GiftPreview";
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
  hasBlockingWarning?: boolean;
  blockingCount?: number;
}

export default function CartSummary({ cart, hasBlockingWarning = false, blockingCount = 0 }: CartSummaryProps) {
  const router = useRouter();
  const clearCart = useClearCart();
  const { isAuthenticated } = useAuth();
  const subtotal = cartSubtotal(cart);

  function handleClear() {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Đã xoá giỏ hàng"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá giỏ hàng thất bại"),
    });
  }

  function handleCheckout() {
    router.push(isAuthenticated ? "/checkout" : "/login?returnUrl=/checkout");
  }

  const secondaryActions = (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Text>Tạm tính</Text>
        <Title level={5} style={{ margin: 0 }}>
          {formatVnd(subtotal)}
        </Title>
      </Space>
      <Text type="secondary">Phí vận chuyển: tính khi thanh toán</Text>
      <Popconfirm title="Xoá toàn bộ giỏ hàng?" onConfirm={handleClear}>
        <Button danger block loading={clearCart.isPending}>
          Xoá giỏ hàng
        </Button>
      </Popconfirm>
      <Link href="/products">
        <Button block>Tiếp tục mua sắm</Button>
      </Link>
    </Space>
  );

  const warningAlert = hasBlockingWarning ? (
    <Alert
      type="warning"
      showIcon
      message={`Có ${blockingCount} sản phẩm vượt số lượng còn lại`}
      description="Vui lòng cập nhật số lượng trước khi thanh toán."
      style={{ marginBottom: 12 }}
    />
  ) : null;

  return (
    <div className="cart-summary">
      <div className="cart-summary-desktop">
        <Card title="Tóm tắt đơn hàng">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {secondaryActions}
            {warningAlert}
            <Button type="primary" block size="large" disabled={hasBlockingWarning} onClick={handleCheckout}>
              Thanh toán
            </Button>
          </Space>
        </Card>
      </div>

      <div className="cart-summary-mobile">
        <Collapse
          items={[
            {
              key: "summary",
              label: `Tóm tắt đơn hàng · ${formatVnd(subtotal)}`,
              children: secondaryActions,
            },
          ]}
        />
        <div style={{ marginTop: 12 }}>
          {warningAlert}
          <Button type="primary" block size="large" disabled={hasBlockingWarning} onClick={handleCheckout}>
            Thanh toán
          </Button>
        </div>
      </div>

      <GiftPreview />

      <style>{`
        .cart-summary-desktop { display: none; }
        .cart-summary-mobile { display: block; }
        @media (min-width: 1024px) {
          .cart-summary-desktop { display: block; position: sticky; top: var(--space-5); }
          .cart-summary-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}
