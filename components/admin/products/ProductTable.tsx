"use client";

import { useRouter } from "next/navigation";
import { Button, Image, Popconfirm, Space, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useArchiveProduct, usePublishProduct } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import { ProductStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { ProductStatus, ProductSummaryDto } from "@/types/products";

interface ProductTableProps {
  items: ProductSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function ProductTable({ items, loading, pagination, onPageChange }: ProductTableProps) {
  const router = useRouter();
  const publishMutation = usePublishProduct();
  const archiveMutation = useArchiveProduct();

  function handlePublish(id: string) {
    publishMutation.mutate(id, {
      onSuccess: () => toast.success("Đã xuất bản sản phẩm"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xuất bản thất bại"),
    });
  }

  function handleArchive(id: string) {
    archiveMutation.mutate(id, {
      onSuccess: () => toast.success("Đã lưu trữ sản phẩm"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Lưu trữ thất bại"),
    });
  }

  const columns: TableProps<ProductSummaryDto>["columns"] = [
    {
      title: "Ảnh",
      dataIndex: "primaryImageUrl",
      width: 72,
      render: (url: string | null) =>
        url ? (
          <Image src={url} alt="" width={48} height={48} style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ width: 48, height: 48, background: "var(--color-border)" }} />
        ),
    },
    { title: "Tên", dataIndex: "name" },
    { title: "SKU", dataIndex: "sku" },
    {
      title: "Giá",
      key: "price",
      render: (_, record) =>
        record.minPrice !== record.maxPrice
          ? `${formatVnd(record.minPrice)} – ${formatVnd(record.maxPrice)}`
          : formatVnd(record.price),
    },
    { title: "Phân loại", dataIndex: "variantCount", align: "right" },
    { title: "Danh mục", dataIndex: "categoryName", render: (v: string | null) => v ?? "—" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => <ProductStatusBadge status={status as ProductStatus} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => router.push(`/admin/products/${record.id}/edit`)}>
            Sửa
          </Button>
          {record.status !== "Published" && (
            <Popconfirm title="Xuất bản sản phẩm này?" onConfirm={() => handlePublish(record.id)}>
              <Button size="small">Xuất bản</Button>
            </Popconfirm>
          )}
          {record.status !== "Archived" && (
            <Popconfirm title="Lưu trữ sản phẩm này?" onConfirm={() => handleArchive(record.id)}>
              <Button size="small" danger>
                Lưu trữ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ResponsiveTable<ProductSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có sản phẩm"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.name}
          status={<ProductStatusBadge status={record.status as ProductStatus} />}
          fields={[
            { label: "SKU", value: record.sku },
            {
              label: "Giá",
              value:
                record.minPrice !== record.maxPrice
                  ? `${formatVnd(record.minPrice)} – ${formatVnd(record.maxPrice)}`
                  : formatVnd(record.price),
            },
            { label: "Phân loại", value: record.variantCount },
            { label: "Danh mục", value: record.categoryName ?? "—" },
          ]}
          action={
            <>
              <Button size="small" onClick={() => router.push(`/admin/products/${record.id}/edit`)}>
                Sửa
              </Button>
              {record.status !== "Published" && (
                <Popconfirm title="Xuất bản sản phẩm này?" onConfirm={() => handlePublish(record.id)}>
                  <Button size="small">Xuất bản</Button>
                </Popconfirm>
              )}
              {record.status !== "Archived" && (
                <Popconfirm title="Lưu trữ sản phẩm này?" onConfirm={() => handleArchive(record.id)}>
                  <Button size="small" danger>
                    Lưu trữ
                  </Button>
                </Popconfirm>
              )}
            </>
          }
        />
      )}
    />
  );
}
