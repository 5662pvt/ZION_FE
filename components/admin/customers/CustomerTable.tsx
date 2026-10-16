"use client";

import dayjs from "dayjs";
import { Button, Popconfirm, Space, Tag, Tooltip, type TableProps } from "antd";
import { FiCheck, FiCheckCircle, FiEye, FiLock, FiXCircle } from "react-icons/fi";
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

const ellipsisTextStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
} as const;

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
      <Space size={4} style={{ flexWrap: "nowrap" }}>
        <Button size="small" icon={<FiEye aria-hidden />} onClick={() => onView(record)}>
          Chi tiết
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
    {
      title: "Email",
      dataIndex: "email",
      width: 180,
      render: (value: string, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <Tooltip title={value}>
            <span style={{ ...ellipsisTextStyle, flex: "1 1 auto" }}>{value}</span>
          </Tooltip>
          <Tooltip title={record.emailConfirmed ? "Đã xác thực email" : "Chưa xác thực email"}>
            <span style={{ flexShrink: 0, display: "inline-flex" }}>
              {record.emailConfirmed ? (
                <FiCheckCircle color="var(--color-success)" aria-hidden />
              ) : (
                <FiXCircle color="var(--color-danger)" aria-hidden />
              )}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Tên",
      dataIndex: "displayName",
      width: 110,
      render: (value: string | null) =>
        value ? (
          <Tooltip title={value}>
            <span style={{ ...ellipsisTextStyle, display: "block" }}>{value}</span>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      width: 110,
      render: (value: string | null) => (
        <span style={{ whiteSpace: "nowrap" }}>{value ?? "—"}</span>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      width: 100,
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
      width: 80,
      render: (isActive: boolean) => <CustomerStatusBadge isActive={isActive} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 130,
      render: (value: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(value).format("DD/MM/YYYY HH:mm")}</span>,
    },
    {
      title: "Đăng nhập gần nhất",
      dataIndex: "lastLoginAt",
      width: 135,
      render: (value: string | null) => (
        <span style={{ whiteSpace: "nowrap" }}>{value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—"}</span>
      ),
    },
    { title: "Thao tác", key: "actions", fixed: "right", width: 200, render: (_, record) => renderActions(record) },
  ];

  return (
    <ResponsiveTable<AdminCustomerSummaryDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      scrollX={1045}
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
