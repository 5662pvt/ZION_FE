"use client";

import FlashSaleForm from "@/components/admin/flash-sales/FlashSaleForm";
import PageHeader from "@/components/ui/PageHeader";

export default function NewFlashSalePage() {
  return (
    <div>
      <PageHeader title="Tạo flash sale" />
      <FlashSaleForm mode="create" />
    </div>
  );
}
