export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SECTION_LABELS: Record<string, string> = {
  products: "Sản phẩm",
  categories: "Danh mục",
  orders: "Đơn hàng",
  inventory: "Tồn kho",
  promotions: "Khuyến mãi",
  reviews: "Đánh giá",
  reports: "Báo cáo",
  system: "Hệ thống",
  customers: "Khách hàng",
  payments: "Thanh toán",
  "audit-logs": "Nhật ký thao tác",
};

const SYSTEM_LABELS: Record<string, string> = {
  health: "Sức khoẻ hệ thống",
  messages: "Outbox / Inbox",
  dlq: "Hàng đợi lỗi (DLQ)",
};

export function resolveBreadcrumb(pathname: string): BreadcrumbItem[] {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (segments.length === 0) return [{ label: "Tổng quan" }];

  const items: BreadcrumbItem[] = [{ label: "Tổng quan", href: "/admin" }];
  const [section, ...rest] = segments;
  const sectionLabel = SECTION_LABELS[section];
  if (!sectionLabel) return items;

  const sectionHref = `/admin/${section}`;
  if (rest.length === 0) {
    items.push({ label: sectionLabel });
    return items;
  }

  if (section === "system") {
    items.push({ label: sectionLabel });
    items.push({ label: SYSTEM_LABELS[rest[0]] ?? sectionLabel });
    return items;
  }

  items.push({ label: sectionLabel, href: sectionHref });

  if (section === "products") {
    if (rest[0] === "new") items.push({ label: "Thêm sản phẩm" });
    else if (rest[1] === "edit") items.push({ label: "Sửa sản phẩm" });
  } else if (section === "promotions") {
    items.push({ label: rest[0] === "new" ? "Tạo khuyến mãi" : "Chi tiết khuyến mãi" });
  } else if (section === "orders") {
    items.push({ label: "Chi tiết đơn hàng" });
  }

  return items;
}
