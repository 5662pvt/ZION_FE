import Link from "next/link";
import { Card, Col, Row } from "antd";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ marginBottom: 24 }}>Số liệu tổng quan sẽ được cập nhật.</p>
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
      </Row>
    </div>
  );
}
