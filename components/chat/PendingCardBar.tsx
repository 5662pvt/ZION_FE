import { Button, Flex, Typography } from "antd";
import { FiX } from "react-icons/fi";
import ChatProductCard from "./ChatProductCard";
import ChatOrderCard from "./ChatOrderCard";
import type { PendingChatCard } from "@/types/chat";

const { Text } = Typography;

interface PendingCardBarProps {
  pendingCard: PendingChatCard;
  onCancel: () => void;
  onSend: () => void;
  sending?: boolean;
}

export default function PendingCardBar({ pendingCard, onCancel, onSend, sending }: PendingCardBarProps) {
  return (
    <div style={{ borderTop: "1px solid var(--color-border)", padding: "8px 12px", background: "var(--color-page)" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
        <Text style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {pendingCard.type === "Product" ? "Gửi sản phẩm này" : "Gửi đơn hàng này"}
        </Text>
        <Button type="text" size="small" icon={<FiX aria-hidden />} aria-label="Bỏ gửi" onClick={onCancel} />
      </Flex>
      <Flex align="center" gap={8}>
        {pendingCard.type === "Product" ? (
          <ChatProductCard card={pendingCard.card} role="Customer" />
        ) : (
          <ChatOrderCard card={pendingCard.card} role="Customer" />
        )}
        <Button type="primary" size="small" onClick={onSend} loading={sending}>
          Gửi
        </Button>
      </Flex>
    </div>
  );
}
