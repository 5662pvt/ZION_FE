"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Collapse, Input, Row, Skeleton, Space, Spin, Steps, Typography } from "antd";
import RequireAuth from "@/components/common/RequireAuth";
import Breadcrumbs from "@/components/shop/layout/Breadcrumbs";
import AddressSelector from "@/components/shop/checkout/AddressSelector";
import PaymentMethodSelector, {
  paymentOptionLabel,
  type CheckoutPaymentOption,
} from "@/components/shop/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/shop/checkout/CheckoutSummary";
import type { AppliedCoupon } from "@/components/shop/checkout/CouponInput";
import { useCart, useInvalidateCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { useOrder, useOrderPolling, usePlaceOrder } from "@/hooks/useOrders";
import { useCreatePaymentIntent } from "@/hooks/usePayments";
import { useMyLoyalty } from "@/hooks/useLoyalty";
import { queryKeys } from "@/constants/queryKeys";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { formatAddress } from "@/utils/address";
import type { PaymentMethod, PlaceOrderRequest } from "@/types/orders";
import type { PaymentChannel } from "@/types/payments";

function buildIdempotencyFingerprint(body: PlaceOrderRequest): string {
  return [
    body.addressId.toLowerCase(),
    body.paymentMethod.toLowerCase(),
    (body.note ?? "").trim(),
    (body.couponCode ?? "").trim().toUpperCase(),
    body.usePoints ? "points" : "no-points",
  ].join("|");
}

function subscribeToDesktopViewport(callback: () => void) {
  const mediaQuery = window.matchMedia("(min-width: 1024px)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsDesktopViewport() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getIsDesktopViewportServerSnapshot() {
  return true;
}

function useIsDesktopViewport() {
  return useSyncExternalStore(subscribeToDesktopViewport, getIsDesktopViewport, getIsDesktopViewportServerSnapshot);
}

const STEP_ITEMS = [
  { title: "Thông tin nhận hàng" },
  { title: "Thanh toán" },
  { title: "Xác nhận đơn" },
];

const { Title, Text } = Typography;
const { TextArea } = Input;

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktopViewport();
  const { data: cart, isCartLoading, isError: isCartError } = useCart();
  const { data: addresses, isLoading: isAddressesLoading, isError: isAddressesError } = useAddresses();
  const { data: loyalty } = useMyLoyalty();
  const placeOrder = usePlaceOrder();
  const createPaymentIntent = useCreatePaymentIntent();
  const invalidateCart = useInvalidateCart();

  const [current, setCurrent] = useState(0);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState(false);
  const [paymentOption, setPaymentOption] = useState<CheckoutPaymentOption>("COD");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [cancelInfo, setCancelInfo] = useState<{ orderId: string; reason: string | null } | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingChannel, setPendingChannel] = useState<PaymentChannel | undefined>(undefined);
  const prevAddressIdsRef = useRef<Set<string> | null>(null);
  const idempotencyRef = useRef<{ key: string; fingerprint: string } | null>(null);
  const pendingHandledRef = useRef<string | null>(null);

  const { data: pendingOrder, refetch: refetchPendingOrder } = useOrder(pendingOrderId ?? "");
  const { timedOut: holdTimedOut } = useOrderPolling(pendingOrderId ?? "", pendingOrder?.status, refetchPendingOrder, {
    statuses: ["PendingStock"],
    intervalMs: 1000,
    maxMs: 20000,
  });

  useEffect(() => {
    if (!pendingOrderId || !pendingOrder) return;
    if (pendingHandledRef.current === pendingOrderId) return;

    if (pendingOrder.status === "AwaitingPayment") {
      pendingHandledRef.current = pendingOrderId;
      const orderId = pendingOrderId;
      const channel = pendingChannel;
      // Thoát trạng thái "đang giữ hàng" ngay khi đơn đổi AwaitingPayment - không có nguồn
      // render-time nào khác để tắt UI poll trước khi tạo payment intent.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingOrderId(null);
      invalidateCart();
      createPaymentIntent.mutate(
        { orderId, channel },
        {
          onSuccess: (intent) => {
            if (channel) {
              try {
                sessionStorage.setItem(`zion:payChannel:${orderId}`, channel);
              } catch {
                // sessionStorage có thể bị chặn - bỏ qua, chỉ mất tính năng nhớ kênh
              }
            }
            router.replace(intent.redirectUrl ?? `/checkout/pay/${intent.intentId}`);
          },
          onError: (intentErr) => {
            toast.error(
              intentErr instanceof ApiError
                ? intentErr.message
                : "Không tạo được giao dịch thanh toán, vui lòng thử lại ở trang đơn hàng."
            );
            router.replace(`/orders/${orderId}`);
          },
        }
      );
      return;
    }

    if (pendingOrder.status === "Cancelled") {
      pendingHandledRef.current = pendingOrderId;
      setCancelInfo({ orderId: pendingOrderId, reason: pendingOrder.cancelReason });
      setPendingOrderId(null);
      invalidateCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrder, pendingOrderId]);

  useEffect(() => {
    if (!holdTimedOut || !pendingOrderId) return;
    if (pendingHandledRef.current === pendingOrderId) return;
    pendingHandledRef.current = pendingOrderId;
    const orderId = pendingOrderId;
    setPendingOrderId(null);
    toast.info("Đơn hàng đang được xử lý, bạn có thể thanh toán khi đơn sẵn sàng.");
    router.replace(`/orders/${orderId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdTimedOut, pendingOrderId]);

  useEffect(() => {
    if (!addresses) return;
    const currentIds = new Set(addresses.map((a) => a.id));
    const prevIds = prevAddressIdsRef.current;
    prevAddressIdsRef.current = currentIds;

    if (prevIds) {
      const newlyAdded = addresses.find((a) => !prevIds.has(a.id));
      if (newlyAdded) {
        setAddressId(newlyAdded.id);
        setAddressError(false);
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

  const selectedAddress = addresses?.find((a) => a.id === addressId) ?? null;

  const handleNext = () => {
    if (current === 0) {
      if (!addressId) {
        setAddressError(true);
        return;
      }
      setAddressError(false);
    }
    setCurrent((c) => Math.min(2, c + 1));
  };

  const handleBack = () => {
    if (pendingOrderId) return;
    setCurrent((c) => Math.max(0, c - 1));
  };

  const handleStepsChange = (next: number) => {
    if (pendingOrderId) return;
    if (next < current) setCurrent(next);
  };

  const handleSubmit = async () => {
    if (placeOrder.isPending || createPaymentIntent.isPending || !!pendingOrderId) return;
    if (!addressId) {
      setCurrent(0);
      setAddressError(true);
      return;
    }
    setStockError(null);
    setCancelInfo(null);

    const paymentMethod: PaymentMethod = paymentOption === "COD" ? "COD" : "Online";
    const channel: PaymentChannel | undefined = paymentOption === "COD" ? undefined : paymentOption;

    const body: PlaceOrderRequest = {
      addressId,
      paymentMethod,
      note: note.trim() ? note.trim() : undefined,
      couponCode: coupon?.code,
      usePoints: usePoints || undefined,
    };

    const fingerprint = buildIdempotencyFingerprint(body);
    const existing = idempotencyRef.current;
    const idempotencyKey = existing && existing.fingerprint === fingerprint ? existing.key : crypto.randomUUID();
    idempotencyRef.current = { key: idempotencyKey, fingerprint };

    try {
      const order = await placeOrder.mutateAsync({ body, idempotencyKey });
      idempotencyRef.current = null;

      if (order.status === "Cancelled") {
        setCancelInfo({ orderId: order.id, reason: order.cancelReason });
        return;
      }

      if (paymentMethod === "Online") {
        // Đơn mới tạo đang PendingStock (giữ hàng bất đồng bộ ~1-3s) - chờ chuyển
        // AwaitingPayment rồi mới tạo payment intent, tránh 409 "đơn chưa sẵn sàng".
        pendingHandledRef.current = null;
        setPendingChannel(channel);
        setPendingOrderId(order.id);
        return;
      }

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

      if (code === "Orders.IdempotencyKeyInProgress") {
        toast.info("Đơn hàng đang được xử lý, vui lòng đợi giây lát rồi thử lại.");
        return;
      }

      if (err.status === 0 || err.status >= 500) {
        toast.error("Không kết nối được máy chủ, vui lòng thử lại.");
        return;
      }

      toast.error(err.message);
      if (code === "Orders.InvalidCoupon" || code?.startsWith("Promotions.")) setCoupon(null);
      if (code === "Orders.PointsUnavailable") setUsePoints(false);
    }
  };

  const submitting = placeOrder.isPending || createPaymentIntent.isPending || !!pendingOrderId;

  const summary = (
    <CheckoutSummary
      embedded={!isDesktop}
      cart={cart}
      coupon={coupon}
      onApplyCoupon={(c) => {
        setCoupon(c);
        setStockError(null);
        setCancelInfo(null);
      }}
      onRemoveCoupon={() => {
        setCoupon(null);
        setStockError(null);
        setCancelInfo(null);
      }}
      onSubmit={current === 2 ? handleSubmit : undefined}
      submitting={submitting}
      disabled={!addressId}
      loyalty={loyalty}
      usePoints={usePoints}
      onToggleUsePoints={setUsePoints}
    />
  );

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumbs items={[{ label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]} />
      <Title level={3}>Thanh toán</Title>
      <Steps current={current} onChange={handleStepsChange} items={STEP_ITEMS} style={{ marginBottom: 24 }} />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {current === 0 && (
            <Card title="Thông tin nhận hàng">
              <AddressSelector
                addresses={addresses ?? []}
                selectedId={addressId}
                onSelect={(id) => {
                  setAddressId(id);
                  setAddressError(false);
                  setStockError(null);
                  setCancelInfo(null);
                }}
              />
              {addressError && (
                <Text type="danger" style={{ display: "block", marginTop: 8 }}>
                  Vui lòng chọn địa chỉ giao hàng
                </Text>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Button type="primary" onClick={handleNext}>
                  Tiếp theo
                </Button>
              </div>
            </Card>
          )}

          {current === 1 && (
            <>
              <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
                <PaymentMethodSelector
                  value={paymentOption}
                  onChange={(value) => {
                    setPaymentOption(value);
                    setStockError(null);
                    setCancelInfo(null);
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
                    setCancelInfo(null);
                  }}
                />
              </Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <Button onClick={handleBack}>Quay lại</Button>
                <Button type="primary" onClick={handleNext}>
                  Tiếp theo
                </Button>
              </div>
            </>
          )}

          {current === 2 && (
            <Card title="Xác nhận đơn hàng">
              {pendingOrderId ? (
                <Space direction="vertical" align="center" size={12} style={{ width: "100%", padding: "24px 0" }}>
                  <Spin size="large" />
                  <Text>Đang giữ hàng cho đơn của bạn…</Text>
                </Space>
              ) : (
                <>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <div>
                      <Text type="secondary">Địa chỉ nhận hàng</Text>
                      {selectedAddress ? (
                        <div>
                          <div>
                            {selectedAddress.recipientName} · {selectedAddress.phoneNumber}
                          </div>
                          <div>{formatAddress(selectedAddress)}</div>
                        </div>
                      ) : (
                        <div>
                          <Text type="danger">Chưa chọn địa chỉ giao hàng</Text>
                        </div>
                      )}
                    </div>
                    <div>
                      <Text type="secondary">Phương thức thanh toán</Text>
                      <div>{paymentOptionLabel(paymentOption)}</div>
                    </div>
                    <div>
                      <Text type="secondary">Ghi chú</Text>
                      <div>{note.trim() || "Không có"}</div>
                    </div>
                  </Space>
                  <div style={{ marginTop: 16 }}>
                    <Button onClick={handleBack} disabled={submitting}>
                      Quay lại
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {cancelInfo && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Đơn hàng đã bị huỷ"
              description={
                <Space direction="vertical" size={4}>
                  <span>{cancelInfo.reason || "Hết hàng"}</span>
                  <Space>
                    <Link href={`/orders/${cancelInfo.orderId}`}>
                      <Button size="small">Xem đơn hàng</Button>
                    </Link>
                    <Link href="/cart">
                      <Button size="small">Xem giỏ hàng</Button>
                    </Link>
                  </Space>
                </Space>
              }
            />
          )}
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
          {isDesktop ? (
            summary
          ) : (
            <Collapse
              defaultActiveKey={["summary"]}
              items={[{ key: "summary", label: "Tóm tắt đơn hàng", children: summary }]}
            />
          )}
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
