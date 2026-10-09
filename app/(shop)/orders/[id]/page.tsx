"use client";

import { Suspense, use } from "react";
import { Spin } from "antd";
import RequireAuth from "@/components/common/RequireAuth";
import OrderDetail from "@/components/shop/order/OrderDetail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);

  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        }
      >
        <OrderDetail orderId={id} />
      </Suspense>
    </RequireAuth>
  );
}
