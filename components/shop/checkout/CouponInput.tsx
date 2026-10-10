"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Flex, Input, Space, Tag, Typography } from "antd";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { ApiError } from "@/services/apiClient";
import { formatVnd } from "@/utils/money";

const { Text } = Typography;

export interface AppliedCoupon {
  code: string;
  promotionName: string;
  discountAmount: number;
}

interface CouponInputProps {
  subtotal: number;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

export default function CouponInput({ subtotal, applied, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();
  const prevSubtotalRef = useRef(subtotal);

  // Giỏ hàng đổi sau khi đã áp mã (vd đổi số lượng) - validate lại với subtotal mới
  // thay vì giữ số tiền giảm đã lỗi thời.
  useEffect(() => {
    const prevSubtotal = prevSubtotalRef.current;
    prevSubtotalRef.current = subtotal;
    if (!applied || subtotal === prevSubtotal) return;

    validateCoupon.mutate(
      { code: applied.code, subtotal },
      {
        onSuccess: (result) => {
          onApply({ code: result.code, promotionName: result.promotionName, discountAmount: result.discountAmount });
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
  }, [subtotal]);

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    validateCoupon.mutate(
      { code: trimmed, subtotal },
      {
        onSuccess: (result) => {
          onApply({ code: result.code, promotionName: result.promotionName, discountAmount: result.discountAmount });
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
