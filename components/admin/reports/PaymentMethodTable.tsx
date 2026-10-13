"use client";

import { Table, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { paymentMethodLabel } from "@/utils/orderStatus";
import type { PaymentMethodBreakdownItem } from "@/types/reports";

interface PaymentMethodTableProps {
  data: PaymentMethodBreakdownItem[];
  loading: boolean;
}

export default function PaymentMethodTable({ data, loading }: PaymentMethodTableProps) {
  const columns: TableProps<PaymentMethodBreakdownItem>["columns"] = [
    {
      title: "Phương thức",
      dataIndex: "method",
      render: (method: PaymentMethodBreakdownItem["method"]) => paymentMethodLabel(method),
    },
    { title: "Số đơn", dataIndex: "orders", align: "right" },
    { title: "Doanh thu", dataIndex: "revenue", align: "right", render: (value: number) => formatVnd(value) },
  ];

  return (
    <Table<PaymentMethodBreakdownItem>
      rowKey="method"
      loading={loading}
      dataSource={data}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "Không có dữ liệu" }}
    />
  );
}
