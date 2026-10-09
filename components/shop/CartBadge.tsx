"use client";

import Link from "next/link";
import { Badge } from "antd";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { cartItemCount } from "@/utils/cartTotals";

export default function CartBadge() {
  const { data: cart, isCartLoading } = useCart();
  const count = isCartLoading ? 0 : cartItemCount(cart);

  return (
    <Link href="/cart" aria-label="Giỏ hàng" style={{ display: "inline-flex", fontSize: 20 }}>
      <Badge count={count} showZero={false} overflowCount={99}>
        <FiShoppingCart />
      </Badge>
    </Link>
  );
}
