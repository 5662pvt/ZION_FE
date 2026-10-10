"use client";

import dayjs from "dayjs";
import { Timeline } from "antd";
import { orderStatusLabel } from "@/utils/orderStatus";
import type { OrderHistoryEntry } from "@/types/adminOrders";

interface AdminOrderTimelineProps {
  history: OrderHistoryEntry[];
}

export default function AdminOrderTimeline({ history }: AdminOrderTimelineProps) {
  if (history.length === 0) return null;

  return (
    <Timeline
      items={history.map((entry, index) => ({
        key: index,
        children: (
          <div>
            <div>{orderStatusLabel(entry.status)}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{dayjs(entry.at).format("DD/MM/YYYY HH:mm")}</div>
            {entry.note && <div style={{ fontSize: 12, color: "#888" }}>{entry.note}</div>}
          </div>
        ),
      }))}
    />
  );
}
