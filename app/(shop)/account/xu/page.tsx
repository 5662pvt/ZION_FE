"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import LoyaltyXuPage from "@/components/account/loyalty/LoyaltyXuPage";

export default function AccountXuPage() {
  return (
    <Suspense fallback={<Spin />}>
      <LoyaltyXuPage />
    </Suspense>
  );
}
