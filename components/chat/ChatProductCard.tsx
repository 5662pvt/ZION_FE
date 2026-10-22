import Link from "next/link";
import { Flex, Image, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import type { ChatProductCardDto } from "@/types/chat";

const { Text } = Typography;

interface ChatProductCardProps {
  card: ChatProductCardDto;
  /** Staff open the storefront product in a new tab; customers navigate in-app. */
  role: "Customer" | "Staff";
}

export default function ChatProductCard({ card, role }: ChatProductCardProps) {
  const href = `/products/${card.slug}`;
  const priceLabel = card.minPrice === card.maxPrice ? formatVnd(card.minPrice) : `${formatVnd(card.minPrice)} – ${formatVnd(card.maxPrice)}`;

  const content = (
    <Flex
      gap={8}
      align="center"
      style={{
        padding: 8,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-control)",
        background: "var(--color-surface)",
        maxWidth: 240,
      }}
    >
      {card.imageUrl ? (
        <Image
          src={card.imageUrl}
          alt={card.name}
          width={48}
          height={48}
          preview={false}
          style={{ objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
        />
      ) : (
        <div
          role="img"
          aria-label={card.name}
          style={{ width: 48, height: 48, borderRadius: 6, background: "var(--color-border)", flexShrink: 0 }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <Text style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {card.name}
        </Text>
        <Text strong style={{ fontSize: 13, color: "var(--color-action)" }}>
          {priceLabel}
        </Text>
      </div>
    </Flex>
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
