import { Empty } from "antd";
import type { ReactNode } from "react";

interface EmptyStateProps {
  description: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ description, action }: EmptyStateProps) {
  return <Empty description={description}>{action}</Empty>;
}
