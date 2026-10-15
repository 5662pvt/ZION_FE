"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Empty, Skeleton } from "antd";
import { useIsClient } from "@/hooks/useIsClient";
import { formatVnd } from "@/utils/money";
import { formatCompactVnd } from "./formatCompactVnd";
import type { ReportSortBy, TopProductItemDto } from "@/types/reports";

interface TopProductsChartProps {
  data: TopProductItemDto[];
  sortBy: ReportSortBy;
  loading: boolean;
}

export default function TopProductsChart({ data, sortBy, loading }: TopProductsChartProps) {
  const isClient = useIsClient();

  if (loading || !isClient) return <Skeleton active style={{ padding: 16 }} />;
  if (data.length === 0) return <Empty description="Không có dữ liệu" />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(320, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={sortBy === "revenue" ? formatCompactVnd : undefined} />
        <YAxis type="category" dataKey="productName" width={160} />
        <Tooltip formatter={(value: number) => (sortBy === "revenue" ? formatVnd(value) : value)} />
        <Bar dataKey={sortBy} name={sortBy === "revenue" ? "Doanh thu" : "Số lượng"} fill="#0F9D8A" />
      </BarChart>
    </ResponsiveContainer>
  );
}
