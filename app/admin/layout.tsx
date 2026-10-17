"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, Button, Drawer, Dropdown, Layout, Menu, type MenuProps } from "antd";
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiBox,
  FiChevronDown,
  FiCreditCard,
  FiExternalLink,
  FiFileText,
  FiHome,
  FiInbox,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiPercent,
  FiShoppingCart,
  FiStar,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import AdminGuard from "@/components/admin/AdminGuard";
import NotificationBell from "@/components/shop/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { resolveBreadcrumb } from "@/components/admin/common/breadcrumb";
import styles from "./admin.module.css";

const { Header, Sider, Content } = Layout;

interface NavEntry {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
  adminOnly?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  items: NavEntry[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    key: "overview",
    label: "Tổng quan",
    items: [
      { key: "dashboard", href: "/admin", icon: <FiHome />, label: "Dashboard" },
      { key: "reports", href: "/admin/reports", icon: <FiBarChart2 />, label: "Báo cáo", adminOnly: true },
    ],
  },
  {
    key: "catalog",
    label: "Catalog",
    items: [
      { key: "products", href: "/admin/products", icon: <FiBox />, label: "Sản phẩm" },
      { key: "categories", href: "/admin/categories", icon: <FiTag />, label: "Danh mục" },
    ],
  },
  {
    key: "warehouse",
    label: "Kho",
    items: [{ key: "inventory", href: "/admin/inventory", icon: <FiLayers />, label: "Tồn kho" }],
  },
  {
    key: "sales",
    label: "Bán hàng",
    items: [
      { key: "orders", href: "/admin/orders", icon: <FiShoppingCart />, label: "Đơn hàng" },
      { key: "promotions", href: "/admin/promotions", icon: <FiPercent />, label: "Khuyến mãi" },
      { key: "reviews", href: "/admin/reviews", icon: <FiStar />, label: "Đánh giá" },
      { key: "customers", href: "/admin/customers", icon: <FiUsers />, label: "Khách hàng", adminOnly: true },
      { key: "payments", href: "/admin/payments", icon: <FiCreditCard />, label: "Thanh toán", adminOnly: true },
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    items: [
      { key: "system-health", href: "/admin/system/health", icon: <FiActivity />, label: "Sức khoẻ hệ thống", adminOnly: true },
      { key: "system-messages", href: "/admin/system/messages", icon: <FiInbox />, label: "Outbox / Inbox", adminOnly: true },
      { key: "system-dlq", href: "/admin/system/dlq", icon: <FiAlertTriangle />, label: "Hàng đợi lỗi (DLQ)", adminOnly: true },
      { key: "audit-logs", href: "/admin/audit-logs", icon: <FiFileText />, label: "Nhật ký thao tác", adminOnly: true },
    ],
  },
];

function resolveSelectedKey(pathname: string, entries: NavEntry[]): string {
  const sorted = [...entries].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find((entry) => (entry.href === "/admin" ? pathname === "/admin" : pathname.startsWith(entry.href)));
  return match?.key ?? "dashboard";
}

function buildMenuItems(groups: NavGroup[], isAdmin: boolean): MenuProps["items"] {
  return groups
    .map((group) => ({
      key: group.key,
      type: "group" as const,
      label: group.label,
      children: group.items
        .filter((entry) => isAdmin || !entry.adminOnly)
        .map((entry) => ({
          key: entry.key,
          icon: entry.icon,
          label: <Link href={entry.href}>{entry.label}</Link>,
        })),
    }))
    .filter((group) => group.children.length > 0);
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const isAdmin = hasRole(ROLES.Admin);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allEntries = useMemo(() => NAV_GROUPS.flatMap((group) => group.items), []);
  const selectedKey = useMemo(() => resolveSelectedKey(pathname, allEntries), [pathname, allEntries]);
  const menuItems = useMemo(() => buildMenuItems(NAV_GROUPS, isAdmin), [isAdmin]);
  const breadcrumbEntries = useMemo(() => resolveBreadcrumb(pathname), [pathname]);
  const breadcrumbItems = useMemo(
    () =>
      breadcrumbEntries.map((item) => ({
        title: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
      })),
    [breadcrumbEntries]
  );
  const pageTitle = breadcrumbEntries[breadcrumbEntries.length - 1]?.label ?? "";

  const accountMenuItems: MenuProps["items"] = [
    { key: "info", label: user?.displayName ?? user?.email, disabled: true },
    { type: "divider" },
    { key: "shop", icon: <FiExternalLink />, label: <Link href="/">Về cửa hàng</Link> },
    { key: "logout", icon: <FiLogOut />, label: "Đăng xuất", onClick: () => void logout() },
  ];

  return (
    <Layout className={styles.layout}>
      <Sider width={240} collapsible collapsed={collapsed} onCollapse={setCollapsed} className={styles.desktopSider}>
        <div className={styles.brand}>{collapsed ? "ZS" : "ZIONShop Admin"}</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        closable={false}
        width={240}
        styles={{ body: { padding: 0, background: "var(--color-primary)" } }}
      >
        <div className={styles.brand}>ZIONShop Admin</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={() => setMobileOpen(false)}
        />
      </Drawer>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              className={styles.mobileTrigger}
              type="text"
              icon={<FiMenu size={20} aria-hidden />}
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            />
            <Breadcrumb className={styles.breadcrumb} items={breadcrumbItems} />
            <span className={styles.pageTitle}>{pageTitle}</span>
          </div>
          <div className={styles.headerRight}>
            <NotificationBell />
            <Dropdown menu={{ items: accountMenuItems }} trigger={["click"]}>
              <Button type="text" className={styles.accountTrigger} aria-label="Tài khoản">
                <FiUser aria-hidden />
                <span className={styles.accountLabel}>{user?.displayName ?? user?.email}</span>
                <FiChevronDown aria-hidden />
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
