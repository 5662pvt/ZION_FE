"use client";

import { useParams } from "next/navigation";
import { Alert, Button, Popconfirm, Space, Spin } from "antd";
import FlashSaleForm from "@/components/admin/flash-sales/FlashSaleForm";
import FlashSaleItemManager from "@/components/admin/flash-sales/FlashSaleItemManager";
import { useActivateFlashSale, useAdminFlashSale, useDeactivateFlashSale } from "@/hooks/useAdminFlashSales";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import PageHeader from "@/components/ui/PageHeader";

export default function FlashSaleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: flashSale, isLoading, isError } = useAdminFlashSale(id);
  const activateMutation = useActivateFlashSale();
  const deactivateMutation = useDeactivateFlashSale();

  function handleActivate() {
    activateMutation.mutate(id, {
      onSuccess: () => toast.success("Đã bật flash sale"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Bật flash sale thất bại"),
    });
  }

  function handleDeactivate() {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast.success("Đã tắt flash sale"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Tắt flash sale thất bại"),
    });
  }

  if (isLoading) return <Spin />;
  if (isError || !flashSale) return <Alert type="error" message="Không tìm thấy flash sale" />;

  return (
    <div>
      <PageHeader
        title={flashSale.name}
        action={
          flashSale.isActive ? (
            <Popconfirm title="Tắt flash sale này?" onConfirm={handleDeactivate}>
              <Button danger loading={deactivateMutation.isPending}>
                Tắt
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="Bật flash sale này?" onConfirm={handleActivate}>
              <Button type="primary" loading={activateMutation.isPending}>
                Bật
              </Button>
            </Popconfirm>
          )
        }
      />

      <FlashSaleForm mode="edit" flashSale={flashSale} />

      <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Sản phẩm trong flash sale</h2>
        <FlashSaleItemManager flashSaleId={flashSale.id} items={flashSale.items} />
      </Space>
    </div>
  );
}
