"use client";

import { Drawer } from "antd";
import PayloadViewer from "./PayloadViewer";
import type { DlqMessageDto } from "@/types/system";

interface DlqPayloadDrawerProps {
  open: boolean;
  message: DlqMessageDto | null;
  onClose: () => void;
}

export default function DlqPayloadDrawer({ open, message, onClose }: DlqPayloadDrawerProps) {
  return (
    <Drawer title={message ? `Payload — ${message.eventType}` : "Payload"} open={open} onClose={onClose} width={560} destroyOnHidden>
      {message && <PayloadViewer payload={message.payload} />}
    </Drawer>
  );
}
