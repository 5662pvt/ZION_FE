"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";
import { Empty, Skeleton } from "antd";
import { useIsClient } from "@/hooks/useIsClient";
import { orderStatusHex, orderStatusLabel } from "@/utils/orderStatus";
import type { OrderStatus } from "@/types/orders";
import type { StatusBreakdownItem } from "@/types/reports";

function StatusTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as StatusBreakdownItem;
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, padding: 8 }}>
      <div>{orderStatusLabel(point.status)}</div>
      <div>Số đơn: {point.count}</div>
    </div>
  );
}

interface StatusPieChartProps {
  data: StatusBreakdownItem[];
  loading: boolean;
}

export default function StatusPieChart({ data, loading }: StatusPieChartProps) {
  const isClient = useIsClient();

  if (loading || !isClient) return <Skeleton active style={{ padding: 16 }} />;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <Empty description="Không có dữ liệu" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={orderStatusHex(entry.status)} />
          ))}
        </Pie>
        <Tooltip content={<StatusTooltip />} />
        <Legend formatter={(value: string) => orderStatusLabel(value as OrderStatus)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
