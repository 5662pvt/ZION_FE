"use client";

import { Button } from "antd";
import { FiCopy } from "react-icons/fi";
import { toast } from "@/utils/toast";
import styles from "./PayloadViewer.module.css";

interface PayloadViewerProps {
  payload: string;
}

export default function PayloadViewer({ payload }: PayloadViewerProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Đã sao chép payload");
    } catch {
      toast.error("Sao chép thất bại");
    }
  }

  return (
    <div className={styles.wrapper}>
      <Button className={styles.copyButton} size="small" icon={<FiCopy aria-hidden />} onClick={() => void handleCopy()}>
        Sao chép
      </Button>
      <pre className={styles.pre}>{payload}</pre>
    </div>
  );
}
