"use client";

import { Button, Popconfirm, Space, Table, type TableColumnsType } from "antd";
import type { CategoryTreeNodeDto } from "@/types/categories";

interface CategoryTreeTableProps {
  data: CategoryTreeNodeDto[];
  loading: boolean;
  deletingId: string | null;
  onEdit: (category: CategoryTreeNodeDto) => void;
  onAddChild: (parent: CategoryTreeNodeDto) => void;
  onDelete: (category: CategoryTreeNodeDto) => void;
}

export default function CategoryTreeTable({ data, loading, deletingId, onEdit, onAddChild, onDelete }: CategoryTreeTableProps) {
  const columns: TableColumnsType<CategoryTreeNodeDto> = [
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 100 },
    {
      title: "Hành động",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onAddChild(record)}>
            Thêm danh mục con
          </Button>
          <Button type="link" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc muốn xóa danh mục này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record)}
          >
            <Button type="link" danger loading={deletingId === record.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      locale={{ emptyText: "Chưa có danh mục nào" }}
    />
  );
}
