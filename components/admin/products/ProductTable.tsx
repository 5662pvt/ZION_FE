"use client";

import { useRouter } from "next/navigation";
import { Button, Image, Popconfirm, Space, Table, Tag, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useArchiveProduct, usePublishProduct } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import type { ProductSummaryDto } from "@/types/products";

const STATUS_COLOR: Record<string, string> = {
  Draft: "default",
  Published: "green",
  Archived: "red",
};

const STATUS_LABEL: Record<string, string> = {
  Draft: "Nháp",
  Published: "Đã xuất bản",
  Archived: "Lưu trữ",
};

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
          <div style={{ width: 48, height: 48, background: "#f0f0f0" }} />
        ),
    },
    { title: "Tên", dataIndex: "name" },
    { title: "SKU", dataIndex: "sku" },
    { title: "Giá", dataIndex: "price", render: (price: number) => formatVnd(price) },
    { title: "Danh mục", dataIndex: "categoryName", render: (v: string | null) => v ?? "—" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => <Tag color={STATUS_COLOR[status] ?? "default"}>{STATUS_LABEL[status] ?? status}</Tag>,
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
              <Button size="small">Publish</Button>
            </Popconfirm>
          )}
          {record.status !== "Archived" && (
            <Popconfirm title="Lưu trữ sản phẩm này?" onConfirm={() => handleArchive(record.id)}>
              <Button size="small" danger>
                Archive
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<ProductSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      locale={{ emptyText: "Chưa có sản phẩm" }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
}
