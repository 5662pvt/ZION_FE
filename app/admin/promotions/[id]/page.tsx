"use client";

import { useParams } from "next/navigation";
import { Alert, Button, Popconfirm, Space, Spin, Tag, Typography } from "antd";
import PromotionForm from "@/components/admin/promotions/PromotionForm";
import CouponManager from "@/components/admin/promotions/CouponManager";
import { useActivatePromotion, useAdminPromotion, useDeactivatePromotion } from "@/hooks/useAdminPromotions";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { PromotionStatus } from "@/types/promotions";

const STATUS_COLOR: Record<PromotionStatus, string> = {
  Active: "green",
  Inactive: "default",
  Scheduled: "blue",
  Expired: "red",
};

const STATUS_LABEL: Record<PromotionStatus, string> = {
  Active: "Đang chạy",
  Inactive: "Tạm tắt",
  Scheduled: "Sắp diễn ra",
  Expired: "Hết hạn",
};

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
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }} wrap>
        <Space>
          <h1 style={{ margin: 0 }}>{promotion.name}</h1>
          <Tag color={STATUS_COLOR[promotion.status]}>{STATUS_LABEL[promotion.status]}</Tag>
        </Space>
        {promotion.isActive ? (
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
        )}
      </Space>

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
