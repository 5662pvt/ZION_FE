"use client";

import { Alert, Col, Row, Skeleton } from "antd";
import { useCart } from "@/hooks/useCart";
import CartTable from "@/components/shop/cart/CartTable";
import CartSummary from "@/components/shop/cart/CartSummary";
import EmptyCart from "@/components/shop/cart/EmptyCart";

export default function CartPage() {
  const { data: cart, isCartLoading, isError } = useCart();

  if (isCartLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Không tải được giỏ hàng" showIcon />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: "48px 24px" }}>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Giỏ hàng</h1>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <CartTable items={cart.items} />
        </Col>
        <Col xs={24} lg={8}>
          <CartSummary cart={cart} />
        </Col>
      </Row>
    </div>
  );
}
