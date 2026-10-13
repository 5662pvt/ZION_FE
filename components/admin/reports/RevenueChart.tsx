"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { Empty, Skeleton } from "antd";
import { useIsClient } from "@/hooks/useIsClient";
import { formatVnd } from "@/utils/money";
import { formatCompactVnd } from "./formatCompactVnd";
import type { ReportGranularity, RevenueSeriesPoint } from "@/types/reports";

interface RevenueChartProps {
  data: RevenueSeriesPoint[];
  loading: boolean;
  granularity: ReportGranularity;
}

function RevenueTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as RevenueSeriesPoint;
  return (
    <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 4, padding: 8 }}>
      <div>Kỳ: {label}</div>
      <div>Doanh thu: {formatVnd(point.revenue)}</div>
      <div>Số đơn hoàn tất: {point.orders}</div>
    </div>
  );
}

export default function RevenueChart({ data, loading, granularity }: RevenueChartProps) {
  const isClient = useIsClient();

  if (loading || !isClient) return <Skeleton active style={{ padding: 16 }} />;
  if (data.length === 0) return <Empty description="Không có dữ liệu" />;

  if (granularity === "day") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis tickFormatter={formatCompactVnd} />
          <Tooltip content={<RevenueTooltip />} />
          <Bar dataKey="revenue" name="Doanh thu" fill="#1677ff" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" />
        <YAxis tickFormatter={formatCompactVnd} />
        <Tooltip content={<RevenueTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#1677ff" fill="#1677ff" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
