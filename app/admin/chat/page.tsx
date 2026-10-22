"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spin, Typography } from "antd";
import { useAdminChatUnreadCount } from "@/hooks/useAdminChat";
import ConversationList from "@/components/admin/chat/ConversationList";
import ConversationPane from "@/components/admin/chat/ConversationPane";
import type { ConversationDto } from "@/types/chat";
import styles from "./chat.module.css";

const { Text } = Typography;

function AdminChatPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("c");

  const { data: unreadCount } = useAdminChatUnreadCount();

  useEffect(() => {
    const n = unreadCount?.conversations ?? 0;
    document.title = n > 0 ? `(${n}) Chat — ZIONShop Admin` : "Chat — ZIONShop Admin";
    return () => {
      document.title = "ZIONShop";
    };
  }, [unreadCount]);

  function selectConversation(conversation: ConversationDto) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("c", conversation.id);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function clearSelection() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("c");
    router.replace(sp.toString() ? `${pathname}?${sp.toString()}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className={styles.page}>
        <div className={`${styles.listPane} ${selectedId ? styles.hiddenMobile : ""}`}>
          <ConversationList selectedId={selectedId} onSelect={selectConversation} />
        </div>
        <div className={`${styles.conversationPane} ${!selectedId ? styles.hiddenMobile : ""}`}>
          {selectedId ? (
            <ConversationPane key={selectedId} conversationId={selectedId} onBack={clearSelection} />
          ) : (
            <div className={styles.empty}>
              <Text type="secondary">Chọn một cuộc trò chuyện</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<Spin />}>
      <AdminChatPageContent />
    </Suspense>
  );
}
