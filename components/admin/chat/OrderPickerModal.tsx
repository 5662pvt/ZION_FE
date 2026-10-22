"use client";

import { useState } from "react";
import { Input, List, Modal, Skeleton, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useSendAdminMessage } from "@/hooks/useAdminChat";
import { formatVnd } from "@/utils/money";
import { orderStatusLabel } from "@/utils/orderStatus";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "./useDebouncedValue";

const { Text } = Typography;

interface OrderPickerModalProps {
  open: boolean;
  conversationId: string;
  customerName: string;
  onClose: () => void;
}

export default function OrderPickerModal({ open, conversationId, customerName, onClose }: OrderPickerModalProps) {
  const [keyword, setKeyword] = useState(customerName);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setKeyword(customerName);
  }
  const debouncedKeyword = useDebouncedValue(keyword, 300).trim();
  const sendMessage = useSendAdminMessage(conversationId);

  const { data, isFetching } = useAdminOrders({ keyword: debouncedKeyword || undefined, pageSize: 10 });

  function handlePick(orderId: string, code: string) {
    sendMessage.mutate(
      { type: "Order", orderId },
      {
        onSuccess: () => {
          toast.success(`Đã gửi đơn ${code} vào cuộc trò chuyện`);
          onClose();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi đơn hàng thất bại"),
      }
    );
  }

  return (
    <Modal
      title="Gửi đơn hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Input.Search
        autoFocus
        allowClear
        placeholder="Mã đơn hàng, SĐT hoặc tên người nhận"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {isFetching && !data ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState description="Không tìm thấy đơn hàng phù hợp" />
      ) : (
        <List
          dataSource={data?.items ?? []}
          renderItem={(order) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => handlePick(order.id, order.code)}
              actions={[<Tag key="status">{orderStatusLabel(order.status)}</Tag>]}
            >
              <List.Item.Meta
                title={`Đơn ${order.code}`}
                description={
                  <>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {order.recipientName} · {order.phoneNumber} · {dayjs(order.createdAt).format("DD/MM/YYYY")}
                    </Text>
                    <br />
                    <Text strong>{formatVnd(order.total)}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
