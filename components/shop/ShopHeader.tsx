"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown, Flex, Input, Menu, type MenuProps } from "antd";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useCategoryTree } from "@/hooks/useCategories";
import { ROLES } from "@/constants/roles";
import type { CategoryTreeNodeDto } from "@/types/categories";
import CartBadge from "./CartBadge";

function toMenuItems(nodes: CategoryTreeNodeDto[]): MenuProps["items"] {
  return nodes.map((node) => ({
    key: node.id,
    label: <Link href={`/products?categoryId=${node.id}`}>{node.name}</Link>,
    ...(node.children.length > 0 ? { children: toMenuItems(node.children) } : {}),
  }));
}

export default function ShopHeader() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();

  const handleSearch = (value: string) => {
    const keyword = value.trim();
    router.push(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : "/products");
  };

  const accountItems: MenuProps["items"] = isAuthenticated
    ? [
        { key: "account", label: <Link href="/account">Tài khoản</Link> },
        { key: "orders", label: <Link href="/account/orders">Đơn hàng</Link> },
        ...(hasRole(ROLES.Admin, ROLES.Staff) ? [{ key: "admin", label: <Link href="/admin">Quản trị</Link> }] : []),
        { type: "divider" as const },
        { key: "logout", label: "Đăng xuất", icon: <FiLogOut />, onClick: () => void logout() },
      ]
    : [
        { key: "login", label: <Link href="/login">Đăng nhập</Link> },
        { key: "register", label: <Link href="/register">Đăng ký</Link> },
      ];

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
      <Flex align="center" gap="large" style={{ padding: "12px 24px" }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: "#1677ff" }}>
          ZIONShop
        </Link>
        <Input.Search placeholder="Tìm sản phẩm..." allowClear onSearch={handleSearch} style={{ flex: 1, maxWidth: 480 }} />
        <Flex align="center" gap="middle">
          <CartBadge />
          <Dropdown menu={{ items: accountItems }} trigger={["click"]}>
            <Flex align="center" gap="small" style={{ cursor: "pointer" }}>
              <FiUser />
              <span>{isLoading ? "" : isAuthenticated ? user?.displayName ?? user?.email : "Tài khoản"}</span>
            </Flex>
          </Dropdown>
        </Flex>
      </Flex>
      {categoriesLoading ? (
        <div style={{ padding: "8px 24px", color: "#8c8c8c", fontSize: 13 }}>Đang tải danh mục...</div>
      ) : (
        <Menu mode="horizontal" items={toMenuItems(categories ?? [])} />
      )}
    </header>
  );
}
