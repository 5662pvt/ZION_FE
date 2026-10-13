"use client";

import { useState } from "react";
import { Alert, Button, Card, Col, Row, Skeleton, Space } from "antd";
import { useReportsDashboard } from "@/hooks/useReports";
import { reportsService } from "@/services/reports.service";
import { toast } from "@/utils/toast";
import KpiCard from "./KpiCard";
import CurrentValueCard from "./CurrentValueCard";
import RevenueChart from "./RevenueChart";
import StatusPieChart from "./StatusPieChart";
import PaymentMethodTable from "./PaymentMethodTable";

interface OverviewTabProps {
  from: string;
  to: string;
}

export default function OverviewTab({ from, to }: OverviewTabProps) {
  const { data, isLoading, isError } = useReportsDashboard({ from, to });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await reportsService.exportRevenueCsv({ from, to });
    } catch {
      toast.error("Xuất CSV thất bại");
    } finally {
      setExporting(false);
    }
  }

  if (isError) return <Alert type="error" message="Không tải được dữ liệu báo cáo" />;

  const kpis = data?.kpis;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => void handleExport()} loading={exporting}>
          Xuất CSV
        </Button>
      </Space>

      {isLoading || !data || !kpis ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Doanh thu (đơn hoàn tất)" kpi={kpis.revenue} isMoney />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Đơn hoàn tất" kpi={kpis.completedOrders} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Giá trị TB/đơn" kpi={kpis.averageOrderValue} isMoney />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Khách mới" kpi={kpis.newCustomers} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Đơn đặt" kpi={kpis.placedOrders} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Đơn huỷ" kpi={kpis.cancelledOrders} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <KpiCard title="Tổng giảm giá" kpi={kpis.discountTotal} isMoney />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <CurrentValueCard title="Đơn chờ giao" value={kpis.awaitingShipment} href="/admin/orders?status=Confirmed" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <CurrentValueCard title="SP sắp hết hàng" value={kpis.lowStockProducts} href="/admin/inventory?lowStockOnly=true" />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={14}>
              <Card title="Doanh thu theo thời gian">
                <RevenueChart data={data.revenueSeries} loading={isLoading} granularity={data.granularity} />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card title="Trạng thái đơn đặt">
                <StatusPieChart data={data.statusBreakdown} loading={isLoading} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Card title="Phương thức thanh toán">
                <PaymentMethodTable data={data.paymentMethods} loading={isLoading} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
