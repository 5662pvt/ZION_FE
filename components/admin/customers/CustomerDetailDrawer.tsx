"use client";

import dayjs from "dayjs";
import { Descriptions, Drawer, Skeleton, Space, Tag } from "antd";
import { CustomerStatusBadge } from "@/components/ui/StatusBadge";
import { useAdminCustomer } from "@/hooks/useAdminCustomers";

interface CustomerDetailDrawerProps {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
}

export default function CustomerDetailDrawer({ open, customerId, onClose }: CustomerDetailDrawerProps) {
  const { data, isLoading } = useAdminCustomer(customerId ?? "", open && !!customerId);

  return (
    <Drawer title="Chi tiết khách hàng" open={open} onClose={onClose} width={420}>
      {isLoading || !data ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Tên">{data.displayName ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{data.phoneNumber ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Space size={4} wrap>
              {data.roles.map((role) => (
                <Tag key={role}>{role}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <CustomerStatusBadge isActive={data.isActive} />
          </Descriptions.Item>
          <Descriptions.Item label="Xác thực email">{data.emailConfirmed ? "Đã xác thực" : "Chưa xác thực"}</Descriptions.Item>
          <Descriptions.Item label="Số địa chỉ">{data.addressesCount}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{dayjs(data.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Đăng nhập gần nhất">
            {data.lastLoginAt ? dayjs(data.lastLoginAt).format("DD/MM/YYYY HH:mm") : "—"}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
}
