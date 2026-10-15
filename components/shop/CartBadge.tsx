"use client";

import Link from "next/link";
import { Badge } from "antd";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { cartItemCount } from "@/utils/cartTotals";

interface CartBadgeProps {
  variant?: "icon" | "tab";
  active?: boolean;
}

export default function CartBadge({ variant = "icon", active }: CartBadgeProps) {
  const { data: cart, isCartLoading } = useCart();
  const count = isCartLoading ? 0 : cartItemCount(cart);

  if (variant === "tab") {
    return (
      <Link
        href="/cart"
        aria-label="Giỏ hàng"
        aria-current={active ? "page" : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minWidth: 44,
          minHeight: 44,
          padding: "4px 8px",
          fontSize: 11,
          color: active ? "var(--color-action)" : "var(--color-muted)",
        }}
      >
        <Badge count={count} showZero={false} overflowCount={99} size="small">
          <FiShoppingCart size={20} aria-hidden />
        </Badge>
        <span>Giỏ hàng</span>
      </Link>
    );
  }

  return (
    <Link href="/cart" aria-label="Giỏ hàng" style={{ display: "inline-flex", fontSize: 20 }}>
      <Badge count={count} showZero={false} overflowCount={99}>
        <FiShoppingCart />
      </Badge>
    </Link>
  );
}
