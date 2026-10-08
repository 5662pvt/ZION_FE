"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Layout, Menu, Space, type MenuProps } from "antd";
import AdminGuard from "@/components/admin/AdminGuard";
import { useAuth } from "@/hooks/useAuth";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "dashboard", label: <Link href="/admin">Dashboard</Link> },
  { key: "products", label: "Sản phẩm", disabled: true },
  { key: "categories", label: "Danh mục", disabled: true },
  { key: "orders", label: "Đơn hàng", disabled: true },
  { key: "inventory", label: "Tồn kho", disabled: true },
  { key: "promotions", label: "Khuyến mãi", disabled: true },
  { key: "reports", label: "Báo cáo", disabled: true },
];

function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", fontWeight: 700, padding: 16, fontSize: 18 }}>ZIONShop Admin</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["dashboard"]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
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
