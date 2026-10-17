"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import UserNotificationList from "@/components/account/notifications/UserNotificationList";

export default function AccountNotificationsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <UserNotificationList />
    </Suspense>
  );
}
