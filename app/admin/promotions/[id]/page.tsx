"use client";

import { useParams } from "next/navigation";
import { Alert, Button, Popconfirm, Space, Spin, Typography } from "antd";
import PromotionForm from "@/components/admin/promotions/PromotionForm";
import CouponManager from "@/components/admin/promotions/CouponManager";
import { useActivatePromotion, useAdminPromotion, useDeactivatePromotion } from "@/hooks/useAdminPromotions";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { PromotionStatusBadge } from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";

export default function PromotionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: promotion, isLoading, isError } = useAdminPromotion(id);
  const activateMutation = useActivatePromotion();
  const deactivateMutation = useDeactivatePromotion();

  function handleActivate() {
    activateMutation.mutate(id, {
      onSuccess: () => toast.success("Đã bật khuyến mãi"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Bật khuyến mãi thất bại"),
    });
  }

  function handleDeactivate() {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast.success("Đã tắt khuyến mãi"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Tắt khuyến mãi thất bại"),
    });
  }

  if (isLoading) return <Spin />;
  if (isError || !promotion) return <Alert type="error" message="Không tìm thấy khuyến mãi" />;

  return (
    <div>
      <PageHeader
        title={
          <Space>
            {promotion.name}
            <PromotionStatusBadge status={promotion.status} />
          </Space>
        }
        action={
          promotion.isActive ? (
            <Popconfirm title="Tắt khuyến mãi này?" onConfirm={handleDeactivate}>
              <Button danger loading={deactivateMutation.isPending}>
                Tắt
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="Bật khuyến mãi này?" onConfirm={handleActivate}>
              <Button type="primary" loading={activateMutation.isPending}>
                Bật
              </Button>
            </Popconfirm>
          )
        }
      />

      <PromotionForm mode="edit" promotion={promotion} />

      {promotion.type === "Gift" ? (
        <Typography.Text type="secondary">
          Khuyến mãi quà tặng tự áp dụng, không dùng mã.
        </Typography.Text>
      ) : (
        <>
          <h2>Mã giảm giá</h2>
          <CouponManager promotionId={promotion.id} coupons={promotion.coupons} />
        </>
      )}
    </div>
  );
}
