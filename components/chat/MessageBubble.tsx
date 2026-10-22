import { Fragment, type ReactNode } from "react";
import dayjs from "dayjs";
import { Image, Typography } from "antd";
import ChatProductCard from "./ChatProductCard";
import ChatOrderCard from "./ChatOrderCard";
import type { ChatMessageDto } from "@/types/chat";

const { Text } = Typography;

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderTextWithLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push(<br key={`br-${lineIndex}`} />);

    let lastIndex = 0;
    const regex = new RegExp(URL_REGEX);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
      const url = match[0];
      nodes.push(
        <a key={`link-${lineIndex}-${match.index}`} href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      );
      lastIndex = match.index + url.length;
    }
    if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
  });

  return nodes;
}

interface MessageBubbleProps {
  message: ChatMessageDto;
  isOwn: boolean;
  role: "Customer" | "Staff";
}

export default function MessageBubble({ message, isOwn, role }: MessageBubbleProps) {
  const bubbleStyle = {
    display: "inline-block",
    maxWidth: "80%",
    padding: message.type === "Text" ? "8px 12px" : 4,
    borderRadius: 14,
    background: isOwn ? "var(--color-action)" : "var(--color-surface)",
    color: isOwn ? "#fff" : "var(--color-text)",
    border: isOwn ? "none" : "1px solid var(--color-border)",
    wordBreak: "break-word" as const,
    whiteSpace: "pre-wrap" as const,
  };

  let body: ReactNode;
  if (message.type === "Image" && message.imageUrl) {
    body = <Image src={message.imageUrl} alt="Hình ảnh" width={180} style={{ borderRadius: 10, display: "block" }} />;
  } else if (message.type === "Product" && message.product) {
    body = <ChatProductCard card={message.product} role={role} />;
  } else if (message.type === "Order" && message.order) {
    body = <ChatOrderCard card={message.order} role={role} />;
  } else {
    body = <Fragment>{renderTextWithLinks(message.text ?? "")}</Fragment>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isOwn && (
        <Text style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 2, marginLeft: 4 }}>{message.senderName}</Text>
      )}
      <div style={bubbleStyle}>{body}</div>
      <Text style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{dayjs(message.createdAt).format("HH:mm")}</Text>
    </div>
  );
}
