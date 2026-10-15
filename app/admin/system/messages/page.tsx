"use client";

import { Suspense } from "react";
import { Spin, Tabs } from "antd";
import PageHeader from "@/components/ui/PageHeader";
import OutboxPanel from "@/components/admin/system/OutboxPanel";
import InboxPanel from "@/components/admin/system/InboxPanel";

export default function AdminSystemMessagesPage() {
  return (
    <div>
      <PageHeader title="Outbox / Inbox" description="Theo dõi thông báo sự kiện gửi đi và nhận vào giữa các module" />
      <Suspense fallback={<Spin />}>
        <Tabs
          items={[
            { key: "outbox", label: "Outbox", children: <OutboxPanel /> },
            { key: "inbox", label: "Inbox", children: <InboxPanel /> },
          ]}
        />
      </Suspense>
    </div>
  );
}
