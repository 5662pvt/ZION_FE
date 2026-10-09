"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Col, Input, Row, Skeleton, Typography } from "antd";
import RequireAuth from "@/components/common/RequireAuth";
import AddressSelector from "@/components/shop/checkout/AddressSelector";
import PaymentMethodSelector from "@/components/shop/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/shop/checkout/CheckoutSummary";
import { useCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { usePlaceOrder } from "@/hooks/useOrders";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { PaymentMethod } from "@/types/orders";

const { Title } = Typography;
const { TextArea } = Input;

function CheckoutContent() {
  const router = useRouter();
  const { data: cart, isCartLoading, isError: isCartError } = useCart();
  const { data: addresses, isLoading: isAddressesLoading, isError: isAddressesError } = useAddresses();
  const placeOrder = usePlaceOrder();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [note, setNote] = useState("");
  const prevAddressIdsRef = useRef<Set<string> | null>(null);

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
    if (!addressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    try {
      const order = await placeOrder.mutateAsync({
        addressId,
        paymentMethod,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success("Đặt hàng thành công");
      router.replace(`/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Thanh toán</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Địa chỉ giao hàng" style={{ marginBottom: 16 }}>
            <AddressSelector addresses={addresses ?? []} selectedId={addressId} onSelect={setAddressId} />
          </Card>
          <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
          </Card>
          <Card title="Ghi chú">
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <CheckoutSummary cart={cart} onSubmit={handleSubmit} submitting={placeOrder.isPending} disabled={!addressId} />
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
