"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import OrderList from "@/components/account/orders/OrderList";

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<Spin />}>
      <OrderList />
    </Suspense>
  );
}
