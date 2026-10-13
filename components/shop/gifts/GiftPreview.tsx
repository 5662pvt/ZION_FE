"use client";

import { Card, Flex, Image, Space, Tag, Typography } from "antd";
import { useGiftPreview } from "@/hooks/useGiftPreview";

const { Text } = Typography;

export default function GiftPreview() {
  const { data: gifts } = useGiftPreview();

  if (!gifts || gifts.length === 0) return null;

  return (
    <Card title="Quà tặng kèm" size="small" style={{ marginTop: 16 }}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {gifts.map((gift) => (
          <Flex key={`${gift.promotionId}-${gift.productId}`} gap={12} align="flex-start">
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
              <div style={{ width: 48, height: 48, background: "#f0f0f0" }} />
            )}
            <div style={{ flex: 1 }}>
              <Flex gap={8} align="center" wrap>
                <Text delete={!gift.available}>
                  {gift.productName} × {gift.quantity}
                </Text>
                <Tag color={gift.available ? "gold" : "default"}>{gift.available ? "Quà tặng" : "Hết quà"}</Tag>
              </Flex>
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
