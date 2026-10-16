"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Button, Tag, Tooltip, type TableProps } from "antd";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import type { AuditAction, AuditLogDto } from "@/types/auditLogs";

const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  "Order.Cancel": "Huỷ đơn hàng",
  "Order.Ship": "Giao đơn hàng",
  "Order.Complete": "Hoàn tất đơn hàng",
  "Inventory.Adjust": "Điều chỉnh tồn kho",
  "Product.Create": "Tạo sản phẩm",
  "Product.Update": "Sửa sản phẩm",
  "Product.Archive": "Lưu trữ sản phẩm",
  "Product.Publish": "Xuất bản sản phẩm",
  "Product.ImageAdd": "Thêm ảnh sản phẩm",
  "Product.ImageRemove": "Xoá ảnh sản phẩm",
  "Product.ImageReorder": "Sắp xếp ảnh sản phẩm",
  "Category.Create": "Tạo danh mục",
  "Category.Update": "Sửa danh mục",
  "Category.Delete": "Xoá danh mục",
  "Promotion.Create": "Tạo khuyến mãi",
  "Promotion.Update": "Sửa khuyến mãi",
  "Promotion.Activate": "Kích hoạt khuyến mãi",
  "Promotion.Deactivate": "Tạm tắt khuyến mãi",
  "Coupon.Create": "Tạo mã giảm giá",
  "Coupon.Generate": "Sinh mã giảm giá",
  "Coupon.Deactivate": "Vô hiệu mã giảm giá",
  "Review.Hide": "Ẩn đánh giá",
  "Review.Show": "Hiện đánh giá",
  "Customer.Lock": "Khoá khách hàng",
  "Customer.Unlock": "Mở khoá khách hàng",
  "System.OutboxRetry": "Thử lại outbox",
  "System.OutboxRetryFailed": "Thử lại outbox lỗi",
  "System.DlqRequeue": "Đẩy lại DLQ",
  "System.DlqDelete": "Xoá thông báo DLQ",
};

function auditActionLabel(action: AuditAction): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

interface AuditLogTableProps {
  items: AuditLogDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onView: (record: AuditLogDto) => void;
}

function resourceLink(record: AuditLogDto): string | null {
  if (record.resourceType === "Order") return `/admin/orders/${record.resourceId}`;
  if (record.resourceType === "Product") return `/admin/products/${record.resourceId}/edit`;
  return null;
}

function renderResource(record: AuditLogDto) {
  const href = resourceLink(record);
  const label = `${record.resourceType} · ${record.resourceId}`;
  return href ? <Link href={href}>{label}</Link> : label;
}

export default function AuditLogTable({ items, loading, pagination, onPageChange, onView }: AuditLogTableProps) {
  const columns: TableProps<AuditLogDto>["columns"] = [
    {
      title: "Thời điểm",
      dataIndex: "occurredAt",
      width: 160,
      render: (value: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(value).format("DD/MM/YYYY HH:mm:ss")}</span>,
    },
    {
      title: "Người thực hiện",
      dataIndex: "actorEmail",
      ellipsis: true,
      render: (value: string) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      width: 160,
      render: (value: AuditLogDto["action"]) => <Tag>{auditActionLabel(value)}</Tag>,
    },
    { title: "Đối tượng", key: "resource", width: 160, ellipsis: true, render: (_, record) => renderResource(record) },
    { title: "HTTP", dataIndex: "statusCode", width: 70 },
    { title: "IP", dataIndex: "ipAddress", width: 120 },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 110,
      render: (_, record) => (
        <Button size="small" onClick={() => onView(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <ResponsiveTable<AuditLogDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      scrollX={890}
      emptyText="Chưa có nhật ký thao tác"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={auditActionLabel(record.action)}
          fields={[
            { label: "Thời điểm", value: dayjs(record.occurredAt).format("DD/MM/YYYY HH:mm:ss") },
            { label: "Người thực hiện", value: record.actorEmail },
            { label: "Đối tượng", value: renderResource(record) },
            { label: "HTTP", value: `${record.statusCode}` },
            { label: "IP", value: record.ipAddress },
          ]}
          action={
            <Button size="small" onClick={() => onView(record)}>
              Chi tiết
            </Button>
          }
        />
      )}
    />
  );
}
