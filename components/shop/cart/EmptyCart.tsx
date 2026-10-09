"use client";

import Link from "next/link";
import { Button, Empty } from "antd";

export default function EmptyCart() {
  return (
    <Empty description="Giỏ hàng của bạn đang trống">
      <Link href="/products">
        <Button type="primary">Tiếp tục mua sắm</Button>
      </Link>
    </Empty>
  );
}
