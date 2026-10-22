"use client";

import { Button, Card, Divider, Flex, Space, Switch, Typography } from "antd";
import CouponInput, { type AppliedCoupon } from "@/components/shop/checkout/CouponInput";
import GiftPreview from "@/components/shop/gifts/GiftPreview";
import XuCoinIcon from "@/components/common/XuCoinIcon";
import { formatVnd } from "@/utils/money";
import { estimateShippingFee } from "@/utils/shipping";
import { cartSubtotal } from "@/utils/cartTotals";
import { computeEstimatedEarnedPoints, computeRedeemablePoints } from "@/utils/loyalty";
import type { CartDto } from "@/types/cart";
import type { LoyaltySummaryDto } from "@/types/loyalty";

const { Text, Title } = Typography;

interface CheckoutSummaryProps {
  cart: CartDto;
  coupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
  disabled?: boolean;
  embedded?: boolean;
  loyalty?: LoyaltySummaryDto;
  usePoints?: boolean;
  onToggleUsePoints?: (checked: boolean) => void;
}

export default function CheckoutSummary({
  cart,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  onSubmit,
  submitting,
  disabled,
  embedded,
  loyalty,
  usePoints,
  onToggleUsePoints,
}: CheckoutSummaryProps) {
  const subtotal = cartSubtotal(cart);
  const shippingFee = estimateShippingFee(subtotal);
  const discountAmount = coupon?.discountAmount ?? 0;
  const itemsDiscount = coupon?.discountTarget === "Shipping" ? 0 : discountAmount;

  const redeemablePoints = loyalty
    ? computeRedeemablePoints(loyalty.balance, loyalty.maxRedeemPercent, subtotal - itemsDiscount)
    : 0;
  const pointsDiscount = usePoints && redeemablePoints > 0 ? redeemablePoints : 0;
  const estimatedEarnedPoints = loyalty
    ? computeEstimatedEarnedPoints(subtotal - itemsDiscount - pointsDiscount, loyalty.earnRatePercent)
    : 0;

  const total = subtotal - discountAmount + shippingFee - pointsDiscount;

  const content = (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {cart.items.map((item) => (
        <Flex key={item.id} justify="space-between" align="start">
          <div>
            <Text>
              {item.productName} × {item.quantity}
            </Text>
            {item.variantLabel && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Phân loại: {item.variantLabel}
                </Text>
              </div>
            )}
          </div>
          <Text>{formatVnd(item.subtotal)}</Text>
        </Flex>
      ))}
      <GiftPreview />
      <Divider style={{ margin: "8px 0" }} />
      <CouponInput cart={cart} applied={coupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />
      {loyalty && loyalty.balance > 0 && (
        <>
          <Divider style={{ margin: "8px 0" }} />
          <Flex justify="space-between" align="center">
            <Space size={6}>
              <XuCoinIcon size={18} />
              <Text>
                Dùng {redeemablePoints} Xu{redeemablePoints === 0 ? "" : ` (−${formatVnd(redeemablePoints)})`}
              </Text>
            </Space>
            <Switch
              checked={!!usePoints && redeemablePoints > 0}
              disabled={redeemablePoints === 0}
              onChange={(checked) => onToggleUsePoints?.(checked)}
            />
          </Flex>
          {redeemablePoints === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đơn hàng chưa đủ điều kiện dùng Xu
            </Text>
          )}
        </>
      )}
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
      {pointsDiscount > 0 && (
        <Flex justify="space-between">
          <Text>Xu</Text>
          <Text type="success">−{formatVnd(pointsDiscount)}</Text>
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
      {loyalty && estimatedEarnedPoints > 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Bạn sẽ nhận ~{estimatedEarnedPoints} Xu khi đơn hoàn tất
        </Text>
      )}
      {onSubmit && (
        <Button type="primary" block loading={submitting} disabled={disabled} onClick={onSubmit}>
          Đặt hàng
        </Button>
      )}
    </Space>
  );

  if (embedded) return content;

  return <Card title="Tóm tắt đơn hàng">{content}</Card>;
}
