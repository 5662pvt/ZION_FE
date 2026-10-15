"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { Alert, DatePicker, Result, Space, Spin, Tabs } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import OverviewTab from "@/components/admin/reports/OverviewTab";
import ProductsTab from "@/components/admin/reports/ProductsTab";
import PromotionsTab from "@/components/admin/reports/PromotionsTab";
import PageHeader from "@/components/ui/PageHeader";

const { RangePicker } = DatePicker;
const DATE_FORMAT = "YYYY-MM-DD";
const MAX_RANGE_DAYS = 366;

function defaultRange(): [string, string] {
  const to = dayjs();
  const from = to.subtract(29, "day");
  return [from.format(DATE_FORMAT), to.format(DATE_FORMAT)];
}

function rangePresets(): { label: string; value: [Dayjs, Dayjs] }[] {
  const today = dayjs();
  return [
    { label: "Hôm nay", value: [today, today] },
    { label: "7 ngày", value: [today.subtract(6, "day"), today] },
    { label: "30 ngày", value: [today.subtract(29, "day"), today] },
    { label: "Tháng này", value: [today.startOf("month"), today] },
    {
      label: "Tháng trước",
      value: [today.subtract(1, "month").startOf("month"), today.subtract(1, "month").endOf("month")],
    },
    { label: "Năm nay", value: [today.startOf("year"), today] },
  ];
}

function ReportsPageContent() {
  const { hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!hasRole(ROLES.Admin)) {
    return <Result status="403" title="403" subTitle="Chỉ Admin được xem báo cáo." />;
  }

  const [defaultFrom, defaultTo] = defaultRange();
  const from = searchParams.get("from") ?? defaultFrom;
  const to = searchParams.get("to") ?? defaultTo;

  function updateRange(values: [Dayjs, Dayjs] | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (values) {
      sp.set("from", values[0].format(DATE_FORMAT));
      sp.set("to", values[1].format(DATE_FORMAT));
    } else {
      sp.delete("from");
      sp.delete("to");
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  const rangeValue: [Dayjs, Dayjs] = [dayjs(from), dayjs(to)];
  const isRangeTooLong = rangeValue[1].diff(rangeValue[0], "day") > MAX_RANGE_DAYS;

  return (
    <div>
      <PageHeader title="Báo cáo" description="Doanh thu, sản phẩm và hiệu quả khuyến mãi" />
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          value={rangeValue}
          format={DATE_FORMAT}
          presets={rangePresets()}
          allowClear={false}
          onChange={(values) => {
            if (values && values[0] && values[1]) updateRange([values[0], values[1]]);
          }}
        />
      </Space>

      {isRangeTooLong && (
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="Khoảng thời gian tối đa 366 ngày." />
      )}

      <Tabs
        items={[
          { key: "overview", label: "Tổng quan", children: <OverviewTab from={from} to={to} /> },
          { key: "products", label: "Sản phẩm", children: <ProductsTab from={from} to={to} /> },
          { key: "promotions", label: "Khuyến mãi", children: <PromotionsTab from={from} to={to} /> },
        ]}
      />
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<Spin />}>
      <ReportsPageContent />
    </Suspense>
  );
}
