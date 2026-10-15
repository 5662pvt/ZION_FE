"use client";

import { Button, Card, Image, Popconfirm, Space, Upload, type UploadProps } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { useDeleteProductImage, useReorderProductImages, useUploadProductImage } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProductImageDto } from "@/types/products";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ProductImageManagerProps {
  productId: string;
  images: ProductImageDto[];
}

export default function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const reorderMutation = useReorderProductImages();

  function handleBeforeUpload(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP");
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Ảnh phải nhỏ hơn 5MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  }

  const customRequest: UploadProps["customRequest"] = (options) => {
    const file = options.file as RcFile;
    uploadMutation.mutate(
      { id: productId, file },
      {
        onSuccess: (image) => {
          toast.success("Đã tải ảnh lên");
          options.onSuccess?.(image);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Tải ảnh thất bại");
          options.onError?.(err);
        },
      },
    );
  };

  function handleDelete(imageId: string) {
    deleteMutation.mutate(
      { id: productId, imageId },
      {
        onSuccess: () => toast.success("Đã xoá ảnh"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá ảnh thất bại"),
      },
    );
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const ids = images.map((img) => img.id);
    [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
    reorderMutation.mutate(
      { id: productId, imageIds: ids },
      {
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Sắp xếp ảnh thất bại"),
      },
    );
  }

  return (
    <div>
      <Upload
        accept={ACCEPTED_TYPES.join(",")}
        beforeUpload={handleBeforeUpload}
        customRequest={customRequest}
        showUploadList={false}
      >
        <Button loading={uploadMutation.isPending}>Tải ảnh lên</Button>
      </Upload>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
        {images.length === 0 && <p>Chưa có ảnh nào.</p>}
        {images.map((image, index) => (
          <Card
            key={image.id}
            size="small"
            style={{ width: 180 }}
            cover={<Image src={image.url} alt={image.alt ?? ""} height={140} style={{ objectFit: "cover" }} />}
          >
            {index === 0 && <StatusBadge color="var(--color-primary)">Ảnh chính</StatusBadge>}
            <div style={{ fontSize: 12, color: "var(--color-muted)", minHeight: 18 }}>{image.alt ?? ""}</div>
            <Space style={{ marginTop: 8 }}>
              <Button size="small" icon={<FiArrowUp />} disabled={index === 0} onClick={() => handleMove(index, -1)} />
              <Button
                size="small"
                icon={<FiArrowDown />}
                disabled={index === images.length - 1}
                onClick={() => handleMove(index, 1)}
              />
              <Popconfirm title="Xoá ảnh này?" onConfirm={() => handleDelete(image.id)}>
                <Button size="small" danger icon={<FiTrash2 />} />
              </Popconfirm>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
}
