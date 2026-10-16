"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spin, Tabs } from "antd";
import PageHeader from "@/components/ui/PageHeader";
import OutboxPanel from "@/components/admin/system/OutboxPanel";
import InboxPanel from "@/components/admin/system/InboxPanel";

function MessagesTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = searchParams.get("tab") === "inbox" ? "inbox" : "outbox";

  function handleChange(key: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("tab", key);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={handleChange}
      items={[
        { key: "outbox", label: "Outbox", children: <OutboxPanel /> },
        { key: "inbox", label: "Inbox", children: <InboxPanel /> },
      ]}
    />
  );
}

export default function AdminSystemMessagesPage() {
  return (
    <div>
      <PageHeader title="Outbox / Inbox" description="Theo dõi thông báo sự kiện gửi đi và nhận vào giữa các module" />
      <Suspense fallback={<Spin />}>
        <MessagesTabs />
      </Suspense>
    </div>
  );
}
