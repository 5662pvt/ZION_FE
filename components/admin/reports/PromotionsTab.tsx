"use client";

import { useState } from "react";
import { Alert, Button, Card, Space } from "antd";
import { useReportsPromotions } from "@/hooks/useReports";
import { reportsService } from "@/services/reports.service";
import { toast } from "@/utils/toast";
import PromotionPerformanceTable from "./PromotionPerformanceTable";

interface PromotionsTabProps {
  from: string;
  to: string;
}

export default function PromotionsTab({ from, to }: PromotionsTabProps) {
  const { data, isLoading, isError } = useReportsPromotions({ from, to });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await reportsService.exportPromotionsCsv({ from, to });
    } catch {
      toast.error("Xuất CSV thất bại");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => void handleExport()} loading={exporting}>
          Xuất CSV
        </Button>
      </Space>

      {isError ? (
        <Alert type="error" message="Không tải được dữ liệu khuyến mãi" />
      ) : (
        <Card>
          <PromotionPerformanceTable items={data ?? []} loading={isLoading} />
        </Card>
      )}
    </div>
  );
}
