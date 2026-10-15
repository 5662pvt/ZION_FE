"use client";

import PromotionForm from "@/components/admin/promotions/PromotionForm";
import PageHeader from "@/components/ui/PageHeader";

export default function NewPromotionPage() {
  return (
    <div>
      <PageHeader title="Tạo khuyến mãi" />
      <PromotionForm mode="create" />
    </div>
  );
}
