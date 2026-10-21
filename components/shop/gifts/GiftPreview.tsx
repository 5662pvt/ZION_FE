"use client";

import { Card, Flex, Image, Space, Typography } from "antd";
import { useGiftPreview } from "@/hooks/useGiftPreview";
import { StatusBadge } from "@/components/ui/StatusBadge";

const { Text } = Typography;

export default function GiftPreview() {
  const { data: gifts } = useGiftPreview();

  if (!gifts || gifts.length === 0) return null;

  return (
    <Card title="Quà tặng kèm" size="small" style={{ marginTop: 16 }}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {gifts.map((gift) => (
          <Flex key={`${gift.promotionId}-${gift.variantId}`} gap={12} align="flex-start">
            {gift.imageUrl ? (
              <Image
                src={gift.imageUrl}
                alt={gift.productName}
                width={48}
                height={48}
                preview={false}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 48, height: 48, background: "var(--color-border)" }} />
            )}
            <div style={{ flex: 1 }}>
              <Flex gap={8} align="center" wrap>
                <Text delete={!gift.available}>
                  {gift.productName} × {gift.quantity}
                </Text>
                <StatusBadge color={gift.available ? "var(--color-warning)" : "var(--color-muted)"}>
                  {gift.available ? "Quà tặng" : "Hết quà"}
                </StatusBadge>
              </Flex>
              {gift.variantLabel && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Phân loại: {gift.variantLabel}
                  </Text>
                </div>
              )}
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {gift.promotionName}
                </Text>
              </div>
              {!gift.available && (
                <div>
                  <Text type="warning" style={{ fontSize: 12 }}>
                    Quà tặng đã hết, đơn hàng vẫn được đặt bình thường
                  </Text>
                </div>
              )}
            </div>
          </Flex>
        ))}
      </Space>
    </Card>
  );
}
