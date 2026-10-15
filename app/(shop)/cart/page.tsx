"use client";

import { Col, Row, Skeleton } from "antd";
import { useCart } from "@/hooks/useCart";
import { useAvailabilityBatch } from "@/hooks/useAvailability";
import CartTable from "@/components/shop/cart/CartTable";
import CartSummary from "@/components/shop/cart/CartSummary";
import EmptyCart from "@/components/shop/cart/EmptyCart";
import ErrorState from "@/components/ui/ErrorState";

export default function CartPage() {
  const { data: cart, isCartLoading, isError, refetch } = useCart();
  const productIds = cart ? Array.from(new Set(cart.items.map((item) => item.productId))) : [];
  const { data: availability } = useAvailabilityBatch(productIds);

  if (isCartLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Col>
          <Col xs={24} lg={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <ErrorState message="Không tải được giỏ hàng" onRetry={() => refetch()} />
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

  const overLimitCount = cart.items.filter((item) => {
    const avail = availability?.[item.productId];
    return avail !== undefined && item.quantity > avail.available;
  }).length;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Giỏ hàng</h1>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <CartTable items={cart.items} availability={availability} />
        </Col>
        <Col xs={24} lg={8}>
          <CartSummary cart={cart} hasBlockingWarning={overLimitCount > 0} blockingCount={overLimitCount} />
        </Col>
      </Row>
    </div>
  );
}
