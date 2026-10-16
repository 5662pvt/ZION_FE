"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import NotificationList from "@/components/account/notifications/NotificationList";

export default function AccountNotificationsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <NotificationList />
    </Suspense>
  );
}
