"use client";

import { useState } from "react";
import { Alert, Button, Card, Col, Radio, Row, Select, Space } from "antd";
import { useReportsTopCategories, useReportsTopProducts } from "@/hooks/useReports";
import { reportsService } from "@/services/reports.service";
import { toast } from "@/utils/toast";
import TopProductsTable from "./TopProductsTable";
import TopProductsChart from "./TopProductsChart";
import TopCategoriesTable from "./TopCategoriesTable";
import type { ReportSortBy } from "@/types/reports";

interface ProductsTabProps {
  from: string;
  to: string;
}

const LIMIT_OPTIONS = [10, 20, 50].map((value) => ({ value, label: `Top ${value}` }));

export default function ProductsTab({ from, to }: ProductsTabProps) {
  const [sortBy, setSortBy] = useState<ReportSortBy>("revenue");
  const [limit, setLimit] = useState(10);
  const [exporting, setExporting] = useState(false);

  const {
    data: topProducts,
    isLoading: loadingProducts,
    isError: errorProducts,
  } = useReportsTopProducts({ from, to, sortBy, limit });
  const {
    data: topCategories,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useReportsTopCategories({ from, to, sortBy });

  async function handleExport() {
    setExporting(true);
    try {
      await reportsService.exportTopProductsCsv({ from, to });
    } catch {
      toast.error("Xuất CSV thất bại");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Radio.Group value={sortBy} onChange={(e) => setSortBy(e.target.value as ReportSortBy)}>
          <Radio.Button value="revenue">Theo doanh thu</Radio.Button>
          <Radio.Button value="quantity">Theo số lượng</Radio.Button>
        </Radio.Group>
        <Select value={limit} onChange={setLimit} options={LIMIT_OPTIONS} style={{ width: 120 }} />
        <Button onClick={() => void handleExport()} loading={exporting}>
          Xuất CSV
        </Button>
      </Space>

      {errorProducts || errorCategories ? (
        <Alert type="error" message="Không tải được dữ liệu sản phẩm/danh mục" />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Sản phẩm bán chạy">
              <TopProductsTable items={topProducts ?? []} loading={loadingProducts} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Biểu đồ sản phẩm bán chạy">
              <TopProductsChart data={topProducts ?? []} sortBy={sortBy} loading={loadingProducts} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Danh mục bán chạy">
              <TopCategoriesTable items={topCategories ?? []} loading={loadingCategories} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
