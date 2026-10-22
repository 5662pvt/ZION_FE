"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Flex, Skeleton, Table, Tag, Typography, type TableProps } from "antd";
import AdjustLoyaltyPointsModal from "./AdjustLoyaltyPointsModal";
import XuCoinIcon from "@/components/common/XuCoinIcon";
import { useCustomerLoyalty, useCustomerLoyaltyTransactions } from "@/hooks/useAdminLoyalty";
import { formatVnd } from "@/utils/money";
import type { LoyaltyLotDto, LoyaltyLotSource, LoyaltyTransactionDto } from "@/types/loyalty";

const { Title, Text } = Typography;

const LOT_SOURCE_LABEL: Record<LoyaltyLotSource, string> = {
  Order: "Đơn hàng",
  Review: "Đánh giá",
  AdminAdjust: "Điều chỉnh",
  Restore: "Hoàn lại",
};

interface CustomerLoyaltyPanelProps {
  userId: string;
  enabled: boolean;
}

export default function CustomerLoyaltyPanel({ userId, enabled }: CustomerLoyaltyPanelProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const { data, isLoading } = useCustomerLoyalty(userId, enabled);
  const { data: transactions, isLoading: isTransactionsLoading } = useCustomerLoyaltyTransactions(
    userId,
    { page, pageSize },
    enabled
  );

  if (isLoading || !data) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  const { summary, activeLots } = data;

  const lotColumns: TableProps<LoyaltyLotDto>["columns"] = [
    { title: "Nguồn", dataIndex: "source", render: (value: LoyaltyLotSource) => <Tag>{LOT_SOURCE_LABEL[value]}</Tag> },
    { title: "Ban đầu", dataIndex: "original" },
    { title: "Còn lại", dataIndex: "remaining" },
    { title: "Ngày nhận", dataIndex: "earnedAt", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Hết hạn", dataIndex: "expiresAt", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
  ];

  const transactionColumns: TableProps<LoyaltyTransactionDto>["columns"] = [
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Số Xu",
      dataIndex: "points",
      render: (value: number) => (
        <Text type={value >= 0 ? "success" : "danger"}>{value >= 0 ? `+${value}` : value}</Text>
      ),
    },
    { title: "Số dư sau", dataIndex: "balanceAfter" },
    { title: "Thời gian", dataIndex: "createdAt", render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm") },
  ];

  return (
    <div>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <Flex align="center" gap={12}>
          <XuCoinIcon size={32} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {summary.balance} Xu
            </Title>
            <Text type="secondary">≈ {formatVnd(summary.balance)}</Text>
          </div>
        </Flex>
        <Button type="primary" onClick={() => setAdjustOpen(true)}>
          Điều chỉnh Xu
        </Button>
      </Flex>

      {summary.expiringSoonPoints > 0 && summary.expiringSoonDate && (
        <Text type="warning" style={{ display: "block", marginBottom: 16 }}>
          {summary.expiringSoonPoints} Xu sẽ hết hạn vào {dayjs(summary.expiringSoonDate).format("DD/MM/YYYY")}
        </Text>
      )}

      <Title level={5}>Lô Xu còn hiệu lực</Title>
      <Table<LoyaltyLotDto>
        rowKey="id"
        dataSource={activeLots}
        columns={lotColumns}
        pagination={false}
        size="small"
        style={{ marginBottom: 24 }}
      />

      <Title level={5}>Lịch sử giao dịch</Title>
      <Table<LoyaltyTransactionDto>
        rowKey="id"
        dataSource={transactions?.items ?? []}
        columns={transactionColumns}
        loading={isTransactionsLoading}
        size="small"
        pagination={{
          current: transactions?.pagination.page ?? page,
          pageSize: transactions?.pagination.pageSize ?? pageSize,
          total: transactions?.pagination.totalCount ?? 0,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />

      <AdjustLoyaltyPointsModal open={adjustOpen} userId={userId} onClose={() => setAdjustOpen(false)} />
    </div>
  );
}
