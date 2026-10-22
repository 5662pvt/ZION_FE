import { Typography } from "antd";
import type { ChatSenderRole } from "@/types/chat";

const { Text } = Typography;

interface TypingIndicatorProps {
  /** Role of the viewer; the indicator shows the *other* side typing. */
  viewerRole: ChatSenderRole;
}

export default function TypingIndicator({ viewerRole }: TypingIndicatorProps) {
  return (
    <Text style={{ fontSize: 12, color: "var(--color-muted)", fontStyle: "italic" }}>
      {viewerRole === "Customer" ? "Shop đang soạn tin…" : "Khách đang soạn tin…"}
    </Text>
  );
}
