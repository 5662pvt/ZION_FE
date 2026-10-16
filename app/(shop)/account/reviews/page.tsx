"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import MyReviewList from "@/components/account/reviews/MyReviewList";

export default function AccountReviewsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <MyReviewList />
    </Suspense>
  );
}
