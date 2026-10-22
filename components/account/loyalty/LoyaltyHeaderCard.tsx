"use client";

import { Card, Flex, Skeleton, Typography } from "antd";
import dayjs from "dayjs";
import XuCoinIcon from "@/components/common/XuCoinIcon";
import { formatVnd } from "@/utils/money";
import type { LoyaltySummaryDto } from "@/types/loyalty";

const { Title, Text } = Typography;

interface LoyaltyHeaderCardProps {
  summary: LoyaltySummaryDto | undefined;
  isLoading: boolean;
}

export default function LoyaltyHeaderCard({ summary, isLoading }: LoyaltyHeaderCardProps) {
  if (isLoading || !summary) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <Flex align="center" gap={12}>
        <XuCoinIcon size={40} />
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {summary.balance} Xu
          </Title>
          <Text type="secondary">≈ {formatVnd(summary.balance)}</Text>
        </div>
      </Flex>
      {summary.expiringSoonPoints > 0 && summary.expiringSoonDate && (
        <Text type="warning" style={{ display: "block", marginTop: 12 }}>
          {summary.expiringSoonPoints} Xu sẽ hết hạn vào {dayjs(summary.expiringSoonDate).format("DD/MM/YYYY")}
        </Text>
      )}
      <Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 13 }}>
        Nhận {summary.earnRatePercent}% giá trị đơn khi hoàn tất · +{summary.reviewBonus} Xu khi đánh giá sản phẩm ·
        Dùng tối đa {summary.maxRedeemPercent}% giá trị hàng · 1 Xu = 1đ
      </Text>
    </Card>
  );
}
