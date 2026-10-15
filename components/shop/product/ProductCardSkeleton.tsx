import { Card, Skeleton } from "antd";

export default function ProductCardSkeleton() {
  return (
    <Card
      styles={{ body: { padding: 12 } }}
      cover={<div style={{ aspectRatio: "4 / 5", background: "var(--color-border)" }} />}
    >
      <Skeleton active title={{ width: "90%" }} paragraph={{ rows: 1, width: "50%" }} />
    </Card>
  );
}
