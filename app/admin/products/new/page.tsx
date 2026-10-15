"use client";

import ProductForm from "@/components/admin/products/ProductForm";
import PageHeader from "@/components/ui/PageHeader";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="Thêm sản phẩm"
        description="Lưu sản phẩm trước, sau đó bạn có thể thêm ảnh ở trang chỉnh sửa."
      />
      <ProductForm mode="create" />
    </div>
  );
}
