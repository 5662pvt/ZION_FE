"use client";

import ProductForm from "@/components/admin/products/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1>Thêm sản phẩm</h1>
      <p style={{ color: "#888" }}>
        Lưu sản phẩm trước, sau đó bạn có thể thêm ảnh ở trang chỉnh sửa.
      </p>
      <ProductForm mode="create" />
    </div>
  );
}
