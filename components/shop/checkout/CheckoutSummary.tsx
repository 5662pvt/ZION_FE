"use client";

import { Button, Card, Divider, Flex, Space, Typography } from "antd";
import CouponInput, { type AppliedCoupon } from "@/components/shop/checkout/CouponInput";
import { formatVnd } from "@/utils/money";
import { estimateShippingFee } from "@/utils/shipping";
import { cartSubtotal } from "@/utils/cartTotals";
import type { CartDto } from "@/types/cart";

const { Text, Title } = Typography;

interface CheckoutSummaryProps {
  cart: CartDto;
  coupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
  onSubmit: () => void;
  submitting: boolean;
  disabled: boolean;
}

export default function CheckoutSummary({
  cart,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  onSubmit,
  submitting,
  disabled,
}: CheckoutSummaryProps) {
  const subtotal = cartSubtotal(cart);
  const shippingFee = estimateShippingFee(subtotal);
  const discountAmount = coupon?.discountAmount ?? 0;
  const total = subtotal - discountAmount + shippingFee;

  return (
    <Card title="Tóm tắt đơn hàng">
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        {cart.items.map((item) => (
          <Flex key={item.id} justify="space-between">
            <Text>
              {item.productName} × {item.quantity}
            </Text>
            <Text>{formatVnd(item.subtotal)}</Text>
          </Flex>
        ))}
        <Divider style={{ margin: "8px 0" }} />
        <CouponInput cart={cart} applied={coupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />
        <Divider style={{ margin: "8px 0" }} />
        <Flex justify="space-between">
          <Text>Tạm tính</Text>
          <Text>{formatVnd(subtotal)}</Text>
        </Flex>
        {coupon && (
          <Flex justify="space-between">
            <Text>{coupon.discountTarget === "Shipping" ? "Giảm phí vận chuyển" : "Giảm giá"}</Text>
            <Text type="success">−{formatVnd(discountAmount)}</Text>
          </Flex>
        )}
        <Flex justify="space-between">
          <Text>Phí vận chuyển (dự kiến)</Text>
          <Text>{formatVnd(shippingFee)}</Text>
        </Flex>
        <Divider style={{ margin: "8px 0" }} />
        <Flex justify="space-between" align="center">
          <Text strong>Tổng cộng</Text>
          <Title level={5} style={{ margin: 0 }}>
            {formatVnd(total)}
          </Title>
        </Flex>
        <Button type="primary" block loading={submitting} disabled={disabled} onClick={onSubmit}>
          Đặt hàng
        </Button>
      </Space>
    </Card>
  );
}
