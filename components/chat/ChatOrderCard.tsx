import Link from "next/link";
import { Flex, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import { orderStatusLabel } from "@/utils/orderStatus";
import type { ChatOrderCardDto } from "@/types/chat";
import type { OrderStatus } from "@/types/orders";

const { Text } = Typography;

interface ChatOrderCardProps {
  card: ChatOrderCardDto;
  /** Staff open the admin order detail; customers navigate to their own order page. */
  role: "Customer" | "Staff";
}

export default function ChatOrderCard({ card, role }: ChatOrderCardProps) {
  const href = role === "Staff" ? `/admin/orders/${card.id}` : `/orders/${card.id}`;
  const otherItemsCount = card.itemCount - 1;
  const itemsLabel =
    otherItemsCount > 0 ? `${card.firstItemName} và ${otherItemsCount} sản phẩm khác` : card.firstItemName;

  const content = (
    <div
      style={{
        padding: 8,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-control)",
        background: "var(--color-surface)",
        maxWidth: 240,
      }}
    >
      <Flex justify="space-between" align="center" gap={8}>
        <Text strong style={{ fontSize: 13 }}>
          Đơn {card.code}
        </Text>
        <Text style={{ fontSize: 12, color: "var(--color-muted)" }}>{orderStatusLabel(card.status as OrderStatus)}</Text>
      </Flex>
      <Text style={{ display: "block", fontSize: 13, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {itemsLabel}
      </Text>
      <Text strong style={{ fontSize: 13, color: "var(--color-action)" }}>
        {formatVnd(card.total)}
      </Text>
    </div>
  );

  if (role === "Staff") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}
