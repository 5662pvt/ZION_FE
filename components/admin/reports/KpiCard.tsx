"use client";

import { Card, Statistic } from "antd";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { formatVnd } from "@/utils/money";
import type { KpiValue } from "@/types/reports";

interface KpiCardProps {
  title: string;
  kpi: KpiValue;
  isMoney?: boolean;
}

export default function KpiCard({ title, kpi, isMoney }: KpiCardProps) {
  const formattedValue = isMoney ? formatVnd(kpi.value) : kpi.value.toLocaleString("vi-VN");

  return (
    <Card>
      <Statistic title={title} value={formattedValue} />
      <div style={{ marginTop: 8, fontSize: 13 }}>
        {kpi.changePercent === null ? (
          <span style={{ color: "#8c8c8c" }}>—</span>
        ) : (
          <span style={{ color: kpi.changePercent >= 0 ? "#389e0d" : "#cf1322" }}>
            {kpi.changePercent >= 0 ? <FiArrowUp /> : <FiArrowDown />} {Math.abs(kpi.changePercent).toFixed(1)}%
          </span>
        )}{" "}
        <span style={{ color: "#8c8c8c" }}>so với kỳ trước</span>
      </div>
    </Card>
  );
}
