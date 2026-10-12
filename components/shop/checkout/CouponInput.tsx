"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Flex, Input, Space, Tag, Typography } from "antd";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { ApiError } from "@/services/apiClient";
import { formatVnd } from "@/utils/money";
import type { CartDto } from "@/types/cart";

const { Text } = Typography;

export interface AppliedCoupon {
  code: string;
  promotionName: string;
  discountAmount: number;
  discountTarget: "Items" | "Shipping";
}

interface CouponInputProps {
  cart: CartDto;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

export default function CouponInput({ cart, applied, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();
  const prevCartRef = useRef(cart);
  const isFirstRender = useRef(true);

  // Giỏ hàng đổi sau khi đã áp mã (vd đổi số lượng) - validate lại theo giỏ hàng mới
  // (BE đọc giỏ hàng của người dùng) thay vì giữ số tiền giảm đã lỗi thời.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCartRef.current = cart;
      return;
    }
    if (cart === prevCartRef.current) return;
    prevCartRef.current = cart;
    if (!applied) return;

    validateCoupon.mutate(
      { code: applied.code },
      {
        onSuccess: (result) => {
          onApply({
            code: result.code,
            promotionName: result.promotionName,
            discountAmount: result.discountAmount,
            discountTarget: result.discountTarget,
          });
        },
        onError: (err) => {
          onRemove();
          setError(
            `Mã giảm giá đã bị gỡ do giỏ hàng thay đổi: ${err instanceof ApiError ? err.message : "vui lòng thử lại"}`
          );
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    validateCoupon.mutate(
      { code: trimmed },
      {
        onSuccess: (result) => {
          onApply({
            code: result.code,
            promotionName: result.promotionName,
            discountAmount: result.discountAmount,
            discountTarget: result.discountTarget,
          });
          setCode("");
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Áp dụng mã giảm giá thất bại");
        },
      }
    );
  };

  const handleRemove = () => {
    onRemove();
    setError(null);
    setCode("");
  };

  if (applied) {
    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Space>
            <Tag color="green">{applied.code}</Tag>
            <Text type="success">−{formatVnd(applied.discountAmount)}</Text>
          </Space>
          <a onClick={handleRemove}>Gỡ</a>
        </Flex>
        {error && <Text type="warning">{error}</Text>}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Flex gap={8}>
        <Input
          placeholder="Mã giảm giá"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onPressEnter={handleApply}
        />
        <Button onClick={handleApply} loading={validateCoupon.isPending}>
          Áp dụng
        </Button>
      </Flex>
      {error && <Text type="danger">{error}</Text>}
    </Space>
  );
}
