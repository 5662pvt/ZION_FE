"use client";

import Link from "next/link";
import { Badge } from "antd";
import { FiShoppingCart } from "react-icons/fi";

export default function CartBadge() {
  return (
    <Link href="/cart" aria-label="Giỏ hàng" style={{ display: "inline-flex", fontSize: 20 }}>
      <Badge count={0} showZero={false}>
        <FiShoppingCart />
      </Badge>
    </Link>
  );
}
