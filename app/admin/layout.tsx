"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Layout, Menu, Space, type MenuProps } from "antd";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAuth } from "@/hooks/useAuth";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "dashboard", label: <Link href="/admin">Dashboard</Link> },
  { key: "products", label: <Link href="/admin/products">Sản phẩm</Link> },
  { key: "categories", label: <Link href="/admin/categories">Danh mục</Link> },
  { key: "orders", label: <Link href="/admin/orders">Đơn hàng</Link> },
  { key: "inventory", label: <Link href="/admin/inventory">Tồn kho</Link> },
  { key: "promotions", label: <Link href="/admin/promotions">Khuyến mãi</Link> },
  { key: "reports", label: "Báo cáo", disabled: true },
];

function resolveSelectedKey(pathname: string): string {
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/inventory")) return "inventory";
  if (pathname.startsWith("/admin/promotions")) return "promotions";
  return "dashboard";
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const selectedKey = useMemo(() => resolveSelectedKey(pathname), [pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", fontWeight: 700, padding: 16, fontSize: 18 }}>ZIONShop Admin</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <Link href="/">Về cửa hàng</Link>
          <Space>
            <span>{user?.displayName ?? user?.email}</span>
            <Button onClick={() => void logout()}>Đăng xuất</Button>
          </Space>
        </Header>
        <Content style={{ margin: 24, background: "#fff", padding: 24 }}>{children}</Content>
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
