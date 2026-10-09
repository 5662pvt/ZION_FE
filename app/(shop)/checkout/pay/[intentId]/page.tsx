"use client";

import { use } from "react";
import RequireAuth from "@/components/common/RequireAuth";
import FakeGatewayCard from "@/components/shop/payment/FakeGatewayCard";

interface PaymentGatewayPageProps {
  params: Promise<{ intentId: string }>;
}

export default function PaymentGatewayPage({ params }: PaymentGatewayPageProps) {
  const { intentId } = use(params);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
        <FakeGatewayCard intentId={intentId} />
      </div>
    </RequireAuth>
  );
}
