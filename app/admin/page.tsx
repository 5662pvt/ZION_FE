"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Card, Col, Row, Skeleton } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useReportsDashboard } from "@/hooks/useReports";
import KpiCard from "@/components/admin/reports/KpiCard";
import CurrentValueCard from "@/components/admin/reports/CurrentValueCard";

function AdminKpiRow() {
  const to = dayjs().format("YYYY-MM-DD");
  const from = dayjs().subtract(29, "day").format("YYYY-MM-DD");
  const { data, isLoading } = useReportsDashboard({ from, to });

  if (isLoading || !data) {
    return <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <KpiCard title="Doanh thu (30 ngày)" kpi={data.kpis.revenue} isMoney />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <KpiCard title="Đơn hoàn tất (30 ngày)" kpi={data.kpis.completedOrders} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <CurrentValueCard title="Đơn chờ giao" value={data.kpis.awaitingShipment} href="/admin/orders?status=Confirmed" />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <CurrentValueCard
          title="SP sắp hết hàng"
          value={data.kpis.lowStockProducts}
          href="/admin/inventory?lowStockOnly=true"
        />
      </Col>
    </Row>
  );
}

export default function AdminDashboardPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.Admin);

  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Link href="/admin/reports">Xem báo cáo →</Link>
          </div>
          <AdminKpiRow />
        </>
      )}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/products">
            <Card hoverable title="Sản phẩm">
              Quản lý danh sách sản phẩm
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/categories">
            <Card hoverable title="Danh mục">
              Quản lý cây danh mục sản phẩm
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/orders">
            <Card hoverable title="Đơn hàng">
              Quản lý đơn hàng và trạng thái giao hàng
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/inventory">
            <Card hoverable title="Tồn kho">
              Quản lý tồn kho sản phẩm
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/promotions">
            <Card hoverable title="Khuyến mãi">
              Quản lý khuyến mãi và mã giảm giá
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Link href="/admin/reviews">
            <Card hoverable title="Đánh giá">
              Kiểm duyệt đánh giá sản phẩm
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
