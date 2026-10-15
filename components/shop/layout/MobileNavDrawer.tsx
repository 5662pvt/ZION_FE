"use client";

import Link from "next/link";
import { Drawer, Menu, type MenuProps } from "antd";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useCategoryTree } from "@/hooks/useCategories";
import { ROLES } from "@/constants/roles";
import type { CategoryTreeNodeDto } from "@/types/categories";

function toMenuItems(nodes: CategoryTreeNodeDto[], onNavigate: () => void): MenuProps["items"] {
  return nodes.map((node) => ({
    key: node.id,
    label: (
      <Link href={`/products?categoryId=${node.id}`} onClick={onNavigate}>
        {node.name}
      </Link>
    ),
    ...(node.children.length > 0 ? { children: toMenuItems(node.children, onNavigate) } : {}),
  }));
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();

  const accountItems: MenuProps["items"] = isAuthenticated
    ? [
        {
          key: "account",
          label: (
            <Link href="/account" onClick={onClose}>
              Tài khoản
            </Link>
          ),
        },
        {
          key: "orders",
          label: (
            <Link href="/account/orders" onClick={onClose}>
              Đơn hàng
            </Link>
          ),
        },
        ...(hasRole(ROLES.Admin, ROLES.Staff)
          ? [
              {
                key: "admin",
                label: (
                  <Link href="/admin" onClick={onClose}>
                    Quản trị
                  </Link>
                ),
              },
            ]
          : []),
        { type: "divider" as const },
        {
          key: "logout",
          label: "Đăng xuất",
          icon: <FiLogOut />,
          onClick: () => {
            onClose();
            void logout();
          },
        },
      ]
    : [
        {
          key: "login",
          label: (
            <Link href="/login" onClick={onClose}>
              Đăng nhập
            </Link>
          ),
        },
        {
          key: "register",
          label: (
            <Link href="/register" onClick={onClose}>
              Đăng ký
            </Link>
          ),
        },
      ];

  return (
    <Drawer
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiUser aria-hidden />
          {isLoading ? "" : isAuthenticated ? user?.displayName ?? user?.email : "Tài khoản"}
        </span>
      }
      placement="left"
      open={open}
      onClose={onClose}
      width={300}
    >
      <div style={{ marginBottom: "var(--space-2)", fontWeight: 600, color: "var(--color-muted)", fontSize: 13 }}>
        Danh mục
      </div>
      {categoriesLoading ? (
        <div style={{ color: "var(--color-muted)", fontSize: 13 }}>Đang tải danh mục...</div>
      ) : (
        <Menu mode="inline" items={toMenuItems(categories ?? [], onClose)} />
      )}
      <div
        style={{
          marginTop: "var(--space-5)",
          marginBottom: "var(--space-2)",
          fontWeight: 600,
          color: "var(--color-muted)",
          fontSize: 13,
        }}
      >
        Tài khoản
      </div>
      <Menu mode="inline" items={accountItems} selectable={false} />
    </Drawer>
  );
}
