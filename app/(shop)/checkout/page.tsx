"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Input, Row, Skeleton, Space, Typography } from "antd";
import RequireAuth from "@/components/common/RequireAuth";
import AddressSelector from "@/components/shop/checkout/AddressSelector";
import PaymentMethodSelector from "@/components/shop/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/shop/checkout/CheckoutSummary";
import type { AppliedCoupon } from "@/components/shop/checkout/CouponInput";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { usePlaceOrder } from "@/hooks/useOrders";
import { queryKeys } from "@/constants/queryKeys";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { PaymentMethod, PlaceOrderRequest } from "@/types/orders";

function buildIdempotencyFingerprint(body: PlaceOrderRequest): string {
  return [
    body.addressId.toLowerCase(),
    body.paymentMethod.toLowerCase(),
    (body.note ?? "").trim(),
    (body.couponCode ?? "").trim().toUpperCase(),
  ].join("|");
}

const { Title } = Typography;
const { TextArea } = Input;

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cart, isCartLoading, isError: isCartError } = useCart();
  const { data: addresses, isLoading: isAddressesLoading, isError: isAddressesError } = useAddresses();
  const placeOrder = usePlaceOrder();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const prevAddressIdsRef = useRef<Set<string> | null>(null);
  const idempotencyRef = useRef<{ key: string; fingerprint: string } | null>(null);

  useEffect(() => {
    if (!addresses) return;
    const currentIds = new Set(addresses.map((a) => a.id));
    const prevIds = prevAddressIdsRef.current;
    prevAddressIdsRef.current = currentIds;

    if (prevIds) {
      const newlyAdded = addresses.find((a) => !prevIds.has(a.id));
      if (newlyAdded) {
        setAddressId(newlyAdded.id);
        return;
      }
    }

    setAddressId((current) => {
      if (current && currentIds.has(current)) return current;
      const defaultAddress = addresses.find((a) => a.isDefault);
      return defaultAddress?.id ?? addresses[0]?.id ?? null;
    });
  }, [addresses]);

  if (isCartLoading || isAddressesLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isCartError || isAddressesError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Không tải được thông tin thanh toán" showIcon />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: "48px 24px" }}>
        <Alert
          type="info"
          showIcon
          message="Giỏ hàng của bạn đang trống"
          description={
            <Link href="/products">
              <Button type="primary" style={{ marginTop: 12 }}>
                Tiếp tục mua sắm
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (placeOrder.isPending) return;
    if (!addressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    setStockError(null);

    const body: PlaceOrderRequest = {
      addressId,
      paymentMethod,
      note: note.trim() ? note.trim() : undefined,
      couponCode: coupon?.code,
    };

    const fingerprint = buildIdempotencyFingerprint(body);
    const existing = idempotencyRef.current;
    const idempotencyKey = existing && existing.fingerprint === fingerprint ? existing.key : crypto.randomUUID();
    idempotencyRef.current = { key: idempotencyKey, fingerprint };

    try {
      const order = await placeOrder.mutateAsync({ body, idempotencyKey });
      idempotencyRef.current = null;
      toast.success("Đặt hàng thành công");
      router.replace(`/orders/${order.id}`);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        toast.error("Không kết nối được máy chủ, vui lòng thử lại.");
        return;
      }

      const code = err.errors?.[0]?.code;

      if (code === "Orders.InsufficientStock") {
        setStockError(err.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        return;
      }

      if (code === "Orders.IdempotencyKeyReused") {
        idempotencyRef.current = null;
        toast.warning("Thông tin đơn đã thay đổi, vui lòng bấm Đặt hàng lại.");
        return;
      }

      if (err.status === 0 || err.status >= 500) {
        toast.error("Không kết nối được máy chủ, vui lòng thử lại.");
        return;
      }

      toast.error(err.message);
      if (code === "Orders.InvalidCoupon" || code?.startsWith("Promotions.")) setCoupon(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Thanh toán</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Địa chỉ giao hàng" style={{ marginBottom: 16 }}>
            <AddressSelector
              addresses={addresses ?? []}
              selectedId={addressId}
              onSelect={(id) => {
                setAddressId(id);
                setStockError(null);
              }}
            />
          </Card>
          <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={(value) => {
                setPaymentMethod(value);
                setStockError(null);
              }}
            />
          </Card>
          <Card title="Ghi chú">
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setStockError(null);
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {stockError && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Không đủ hàng"
              description={
                <Space direction="vertical" size={4}>
                  <span>{stockError}</span>
                  <Link href="/cart">
                    <Button size="small">Cập nhật giỏ hàng</Button>
                  </Link>
                </Space>
              }
            />
          )}
          <CheckoutSummary
            cart={cart}
            coupon={coupon}
            onApplyCoupon={(c) => {
              setCoupon(c);
              setStockError(null);
            }}
            onRemoveCoupon={() => {
              setCoupon(null);
              setStockError(null);
            }}
            onSubmit={handleSubmit}
            submitting={placeOrder.isPending}
            disabled={!addressId}
          />
        </Col>
      </Row>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
