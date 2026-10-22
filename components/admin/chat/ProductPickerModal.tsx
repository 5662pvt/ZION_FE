"use client";

import { useState } from "react";
import { Image, Input, List, Modal, Skeleton, Typography } from "antd";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useSendAdminMessage } from "@/hooks/useAdminChat";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "./useDebouncedValue";

const { Text } = Typography;

interface ProductPickerModalProps {
  open: boolean;
  conversationId: string;
  onClose: () => void;
}

export default function ProductPickerModal({ open, conversationId, onClose }: ProductPickerModalProps) {
  const [keyword, setKeyword] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setKeyword("");
  }
  const debouncedKeyword = useDebouncedValue(keyword, 300).trim();
  const sendMessage = useSendAdminMessage(conversationId);

  const { data, isFetching } = useAdminProducts({ keyword: debouncedKeyword || undefined, status: "Published", pageSize: 10 });

  function handlePick(productId: string, name: string) {
    sendMessage.mutate(
      { type: "Product", productId },
      {
        onSuccess: () => {
          toast.success(`Đã gửi sản phẩm "${name}" vào cuộc trò chuyện`);
          onClose();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi sản phẩm thất bại"),
      }
    );
  }

  return (
    <Modal title="Gửi sản phẩm" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <Input.Search
        autoFocus
        allowClear
        placeholder="Tìm sản phẩm theo tên hoặc SKU"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {isFetching && !data ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState description="Không tìm thấy sản phẩm phù hợp" />
      ) : (
        <List
          dataSource={data?.items ?? []}
          renderItem={(product) => (
            <List.Item style={{ cursor: "pointer" }} onClick={() => handlePick(product.id, product.name)}>
              <List.Item.Meta
                avatar={
                  product.primaryImageUrl ? (
                    <Image
                      src={product.primaryImageUrl}
                      alt={product.name}
                      width={40}
                      height={40}
                      preview={false}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--color-border)" }} />
                  )
                }
                title={product.name}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    SKU {product.sku} ·{" "}
                    {product.minPrice === product.maxPrice
                      ? formatVnd(product.minPrice)
                      : `${formatVnd(product.minPrice)} – ${formatVnd(product.maxPrice)}`}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
