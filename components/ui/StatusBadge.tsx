import type { CSSProperties, ReactNode } from "react";
import { orderStatusHex, orderStatusLabel } from "@/utils/orderStatus";
import type { OrderStatus } from "@/types/orders";
import type { PromotionStatus } from "@/types/promotions";
import type { ProductStatus } from "@/types/products";
import type { ReviewStatus } from "@/types/reviews";
import type { HealthStatus, OutboxStatus } from "@/types/system";
import type { AdminPaymentStatus } from "@/types/adminPayments";

interface StatusBadgeProps {
  color: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function StatusBadge({ color, children, style }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "var(--radius-control)",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "20px",
        whiteSpace: "nowrap",
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge color={orderStatusHex(status)}>{orderStatusLabel(status)}</StatusBadge>;
}

const PRODUCT_STATUS: Record<ProductStatus, { label: string; color: string }> = {
  Draft: { label: "Nháp", color: "var(--color-muted)" },
  Published: { label: "Đã xuất bản", color: "var(--color-success)" },
  Archived: { label: "Lưu trữ", color: "var(--color-danger)" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const entry = PRODUCT_STATUS[status];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

const PROMOTION_STATUS: Record<PromotionStatus, { label: string; color: string }> = {
  Active: { label: "Đang chạy", color: "var(--color-success)" },
  Inactive: { label: "Tạm tắt", color: "var(--color-muted)" },
  Scheduled: { label: "Sắp diễn ra", color: "var(--color-primary)" },
  Expired: { label: "Hết hạn", color: "var(--color-danger)" },
};

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const entry = PROMOTION_STATUS[status];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return status === "Published" ? (
    <StatusBadge color="var(--color-success)">Đã hiển thị</StatusBadge>
  ) : (
    <StatusBadge color="var(--color-muted)">Đã ẩn</StatusBadge>
  );
}

export function CouponStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <StatusBadge color="var(--color-success)">Hoạt động</StatusBadge>
  ) : (
    <StatusBadge color="var(--color-muted)">Vô hiệu</StatusBadge>
  );
}

export type StockLevel = "InStock" | "LowStock" | "OutOfStock";

const STOCK_LEVEL: Record<StockLevel, { label: string; color: string }> = {
  InStock: { label: "Còn hàng", color: "var(--color-success)" },
  LowStock: { label: "Sắp hết", color: "var(--color-warning)" },
  OutOfStock: { label: "Hết hàng", color: "var(--color-danger)" },
};

export function StockLevelBadge({ level }: { level: StockLevel }) {
  const entry = STOCK_LEVEL[level];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

const OUTBOX_STATUS: Record<OutboxStatus, { label: string; color: string }> = {
  Pending: { label: "Đang chờ", color: "var(--color-warning)" },
  Failed: { label: "Thất bại", color: "var(--color-danger)" },
  Processed: { label: "Đã gửi", color: "var(--color-success)" },
};

export function OutboxStatusBadge({ status }: { status: OutboxStatus }) {
  const entry = OUTBOX_STATUS[status];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

const HEALTH_STATUS: Record<HealthStatus, { label: string; color: string }> = {
  Healthy: { label: "Hoạt động", color: "var(--color-success)" },
  Degraded: { label: "Suy giảm", color: "var(--color-warning)" },
  Unhealthy: { label: "Lỗi", color: "var(--color-danger)" },
};

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const entry = HEALTH_STATUS[status];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <StatusBadge color="var(--color-success)">Hoạt động</StatusBadge>
  ) : (
    <StatusBadge color="var(--color-danger)">Đã khoá</StatusBadge>
  );
}

const PAYMENT_STATUS: Record<AdminPaymentStatus, { label: string; color: string }> = {
  Pending: { label: "Đang chờ", color: "var(--color-warning)" },
  Succeeded: { label: "Thành công", color: "var(--color-success)" },
  Failed: { label: "Thất bại", color: "var(--color-danger)" },
  Expired: { label: "Hết hạn", color: "var(--color-muted)" },
  Cancelled: { label: "Đã huỷ", color: "var(--color-muted)" },
};

export function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const entry = PAYMENT_STATUS[status];
  return <StatusBadge color={entry.color}>{entry.label}</StatusBadge>;
}

export default StatusBadge;
