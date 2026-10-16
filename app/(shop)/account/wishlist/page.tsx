"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import WishlistList from "@/components/account/wishlist/WishlistList";

export default function AccountWishlistPage() {
  return (
    <Suspense fallback={<Spin />}>
      <WishlistList />
    </Suspense>
  );
}
