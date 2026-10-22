"use client";

import Link from "next/link";
import { Avatar, Button, Typography } from "antd";
import { FiArrowLeft, FiShoppingBag, FiTag } from "react-icons/fi";
import type { ConversationDto } from "@/types/chat";
import styles from "./ConversationHeader.module.css";

const { Title, Text } = Typography;

interface ConversationHeaderProps {
  conversation: ConversationDto;
  onBack: () => void;
  onSendOrder: () => void;
  onSendProduct: () => void;
}

export default function ConversationHeader({ conversation, onBack, onSendOrder, onSendProduct }: ConversationHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.identity}>
        <Button
          className={styles.backButton}
          type="text"
          icon={<FiArrowLeft aria-hidden />}
          aria-label="Quay lại danh sách"
          onClick={onBack}
        />
        <Avatar className={styles.avatar}>{conversation.customerName.charAt(0).toUpperCase()}</Avatar>
        <div className={styles.meta}>
          <Title level={5} className={styles.name}>
            {conversation.customerName}
          </Title>
          <div className={styles.links}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {conversation.customerEmail}
            </Text>
            <Link href={`/admin/customers?keyword=${encodeURIComponent(conversation.customerEmail)}`} style={{ fontSize: 12 }}>
              Xem khách hàng
            </Link>
            <Link href={`/admin/orders?keyword=${encodeURIComponent(conversation.customerEmail)}`} style={{ fontSize: 12 }}>
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="small" icon={<FiShoppingBag aria-hidden />} onClick={onSendOrder}>
          Gửi đơn hàng
        </Button>
        <Button size="small" icon={<FiTag aria-hidden />} onClick={onSendProduct}>
          Gửi sản phẩm
        </Button>
      </div>
    </div>
  );
}
