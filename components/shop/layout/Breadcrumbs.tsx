import Link from "next/link";
import { Breadcrumb } from "antd";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb
      items={[
        { title: <Link href="/">Trang chủ</Link> },
        ...items.map((item) => ({
          title: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
        })),
      ]}
      style={{ marginBottom: "var(--space-4)" }}
    />
  );
}
