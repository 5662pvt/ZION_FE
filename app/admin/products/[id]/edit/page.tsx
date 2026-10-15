"use client";

import { useParams } from "next/navigation";
import { Alert, Button, Popconfirm, Space, Spin } from "antd";
import ProductForm from "@/components/admin/products/ProductForm";
import ProductImageManager from "@/components/admin/products/ProductImageManager";
import { useAdminProduct, useArchiveProduct, usePublishProduct } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { ProductStatusBadge } from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import type { ProductStatus } from "@/types/products";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: product, isLoading, isError } = useAdminProduct(id);
  const publishMutation = usePublishProduct();
  const archiveMutation = useArchiveProduct();

  function handlePublish() {
    publishMutation.mutate(id, {
      onSuccess: () => toast.success("Đã xuất bản sản phẩm"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xuất bản thất bại"),
    });
  }

  function handleArchive() {
    archiveMutation.mutate(id, {
      onSuccess: () => toast.success("Đã lưu trữ sản phẩm"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Lưu trữ thất bại"),
    });
  }

  if (isLoading) return <Spin />;
  if (isError || !product) return <Alert type="error" message="Không tìm thấy sản phẩm" />;

  return (
    <div>
      <PageHeader
        title={
          <Space>
            Sửa sản phẩm
            <ProductStatusBadge status={product.status as ProductStatus} />
          </Space>
        }
        action={
          <Space>
            {product.status !== "Published" && (
              <Popconfirm title="Xuất bản sản phẩm này?" onConfirm={handlePublish}>
                <Button type="primary">Xuất bản</Button>
              </Popconfirm>
            )}
            {product.status !== "Archived" && (
              <Popconfirm title="Lưu trữ sản phẩm này?" onConfirm={handleArchive}>
                <Button danger>Lưu trữ</Button>
              </Popconfirm>
            )}
          </Space>
        }
      />

      <ProductForm mode="edit" product={product} />

      <h2>Hình ảnh</h2>
      <ProductImageManager productId={product.id} images={product.images} />
    </div>
  );
}
