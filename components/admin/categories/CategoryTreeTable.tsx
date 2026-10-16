"use client";

import { Button, Popconfirm, Skeleton, Space, Table, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ListCard from "@/components/admin/common/ListCard";
import type { CategoryTreeNodeDto } from "@/types/categories";
import styles from "./CategoryTreeTable.module.css";

interface CategoryTreeTableProps {
  data: CategoryTreeNodeDto[];
  loading: boolean;
  deletingId: string | null;
  onEdit: (category: CategoryTreeNodeDto) => void;
  onAddChild: (parent: CategoryTreeNodeDto) => void;
  onDelete: (category: CategoryTreeNodeDto) => void;
}

type CategoryTreeTableNode = Omit<CategoryTreeNodeDto, "children"> & { children?: CategoryTreeTableNode[] };

function mapTreeData(nodes: CategoryTreeNodeDto[]): CategoryTreeTableNode[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children.length > 0 ? mapTreeData(node.children) : undefined,
  }));
}

export default function CategoryTreeTable({ data, loading, deletingId, onEdit, onAddChild, onDelete }: CategoryTreeTableProps) {
  const columns: TableColumnsType<CategoryTreeTableNode> = [
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 100 },
    {
      title: "Hành động",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onAddChild(record as CategoryTreeNodeDto)}>
            Thêm danh mục con
          </Button>
          <Button type="link" onClick={() => onEdit(record as CategoryTreeNodeDto)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc muốn xóa danh mục này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record as CategoryTreeNodeDto)}
          >
            <Button type="link" danger loading={deletingId === record.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  function renderNode(category: CategoryTreeNodeDto, depth: number): ReactNode {
    return (
      <div key={category.id}>
        <ListCard
          title={category.name}
          fields={[
            { label: "Slug", value: category.slug },
            { label: "Thứ tự", value: category.displayOrder },
          ]}
          action={
            <Space wrap>
              <Button size="small" onClick={() => onAddChild(category)}>
                Thêm danh mục con
              </Button>
              <Button size="small" onClick={() => onEdit(category)}>
                Sửa
              </Button>
              <Popconfirm
                title="Xóa danh mục"
                description="Bạn có chắc muốn xóa danh mục này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => onDelete(category)}
              >
                <Button size="small" danger loading={deletingId === category.id}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          }
        />
        {category.children.length > 0 && (
          <div className={styles.childList}>{category.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableView}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={mapTreeData(data)}
          loading={loading}
          pagination={false}
          locale={{ emptyText: "Chưa có danh mục nào" }}
        />
      </div>
      <div className={styles.cardView}>
        {loading ? (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </Space>
        ) : data.length === 0 ? (
          <EmptyState description="Chưa có danh mục nào" />
        ) : (
          <div className={styles.nodeList}>{data.map((category) => renderNode(category, 0))}</div>
        )}
      </div>
    </>
  );
}
