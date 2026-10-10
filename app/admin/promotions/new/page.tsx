"use client";

import PromotionForm from "@/components/admin/promotions/PromotionForm";

export default function NewPromotionPage() {
  return (
    <div>
      <h1>Tạo khuyến mãi</h1>
      <PromotionForm mode="create" />
    </div>
  );
}
