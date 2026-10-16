"use client";

import dayjs from "dayjs";
import { Button, Popconfirm, Space, Tag, type TableProps } from "antd";
import { FiCheck, FiLock } from "react-icons/fi";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
import { CustomerStatusBadge } from "@/components/ui/StatusBadge";
import type { AdminCustomerSummaryDto } from "@/types/adminCustomers";

interface CustomerTableProps {
  items: AdminCustomerSummaryDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
  onView: (record: AdminCustomerSummaryDto) => void;
  onLock: (record: AdminCustomerSummaryDto) => void;
  onUnlock: (record: AdminCustomerSummaryDto) => void;
  currentUserId: string | undefined;
  lockPending: boolean;
  unlockPending: boolean;
}

export default function CustomerTable({
  items,
  loading,
  pagination,
  onPageChange,
  onView,
  onLock,
  onUnlock,
  currentUserId,
  lockPending,
  unlockPending,
}: CustomerTableProps) {
  function renderActions(record: AdminCustomerSummaryDto) {
    const isSelf = record.id === currentUserId;
    return (
      <Space>
        <Button size="small" onClick={() => onView(record)}>
          Xem chi tiết
        </Button>
        {!isSelf &&
          (record.isActive ? (
            <Popconfirm title="Khoá tài khoản khách hàng này?" onConfirm={() => onLock(record)}>
              <Button size="small" danger icon={<FiLock aria-hidden />} loading={lockPending}>
                Khoá
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="Mở khoá tài khoản khách hàng này?" onConfirm={() => onUnlock(record)}>
              <Button size="small" icon={<FiCheck aria-hidden />} loading={unlockPending}>
                Mở khoá
              </Button>
            </Popconfirm>
          ))}
      </Space>
    );
  }

  const columns: TableProps<AdminCustomerSummaryDto>["columns"] = [
    { title: "Email", dataIndex: "email" },
    { title: "Tên", dataIndex: "displayName", render: (value: string | null) => value ?? "—" },
    { title: "SĐT", dataIndex: "phoneNumber", render: (value: string | null) => value ?? "—" },
    {
      title: "Vai trò",
      dataIndex: "roles",
      render: (roles: string[]) => (
        <Space size={4} wrap>
          {roles.map((role) => (
            <Tag key={role}>{role}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive: boolean) => <CustomerStatusBadge isActive={isActive} />,
    },
    {
      title: "Xác thực email",
      dataIndex: "emailConfirmed",
      render: (value: boolean) => (value ? "Đã xác thực" : "Chưa xác thực"),
    },
    { title: "Ngày tạo", dataIndex: "createdAt", render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm") },
    {
      title: "Đăng nhập gần nhất",
      dataIndex: "lastLoginAt",
      render: (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—"),
    },
    { title: "Thao tác", key: "actions", render: (_, record) => renderActions(record) },
  ];

  return (
    <ResponsiveTable<AdminCustomerSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      emptyText="Chưa có khách hàng"
      pagination={pagination}
      onPageChange={onPageChange}
      renderCard={(record) => (
        <ListCard
          title={record.email}
          status={<CustomerStatusBadge isActive={record.isActive} />}
          fields={[
            { label: "Tên", value: record.displayName ?? "—" },
            { label: "SĐT", value: record.phoneNumber ?? "—" },
            { label: "Vai trò", value: record.roles.join(", ") },
            { label: "Xác thực email", value: record.emailConfirmed ? "Đã xác thực" : "Chưa xác thực" },
            { label: "Ngày tạo", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") },
            {
              label: "Đăng nhập gần nhất",
              value: record.lastLoginAt ? dayjs(record.lastLoginAt).format("DD/MM/YYYY HH:mm") : "—",
            },
          ]}
          action={renderActions(record)}
        />
      )}
    />
  );
}
