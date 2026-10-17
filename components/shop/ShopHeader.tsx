"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Dropdown, Flex, Input, Menu, type MenuProps } from "antd";
import { FiLogOut, FiMenu, FiSearch, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useCategoryTree } from "@/hooks/useCategories";
import { ROLES } from "@/constants/roles";
import type { CategoryTreeNodeDto } from "@/types/categories";
import AnnouncementBar from "./layout/AnnouncementBar";
import SearchAutocomplete from "./layout/SearchAutocomplete";
import MobileNavDrawer from "./layout/MobileNavDrawer";
import MobileSearchOverlay from "./layout/MobileSearchOverlay";
import CartBadge from "./CartBadge";
import NotificationBell from "./NotificationBell";

function toMenuItems(nodes: CategoryTreeNodeDto[]): MenuProps["items"] {
  return nodes.map((node) => ({
    key: node.id,
    label: <Link href={`/products?categoryId=${node.id}`}>{node.name}</Link>,
    ...(node.children.length > 0 ? { children: toMenuItems(node.children) } : {}),
  }));
}

export default function ShopHeader() {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    <>
      <AnnouncementBar />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Flex
          align="center"
          gap="middle"
          style={{ padding: "10px 16px", maxWidth: "var(--content-max)", margin: "0 auto" }}
        >
          <button
            type="button"
            className="zion-header__hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở menu"
            style={{
              display: "none",
              border: "none",
              background: "none",
              fontSize: 22,
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              cursor: "pointer",
              color: "var(--color-primary)",
            }}
          >
            <FiMenu aria-hidden />
          </button>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>
            ZIONShop
          </Link>
          <div className="zion-header__search-inline" style={{ flex: 1, maxWidth: 480 }}>
            <Suspense fallback={<Input placeholder="Tìm sản phẩm..." disabled aria-label="Tìm sản phẩm" />}>
              <SearchAutocomplete />
            </Suspense>
          </div>
          <Flex align="center" gap="middle" style={{ marginLeft: "auto" }}>
            <button
              type="button"
              className="zion-header__search-trigger"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Tìm sản phẩm"
              style={{
                display: "none",
                border: "none",
                background: "none",
                fontSize: 20,
                padding: 8,
                minWidth: 44,
                minHeight: 44,
                cursor: "pointer",
                color: "var(--color-primary)",
              }}
            >
              <FiSearch aria-hidden />
            </button>
            <NotificationBell />
            <CartBadge />
            <Dropdown menu={{ items: accountItems }} trigger={["click"]}>
              <Flex align="center" gap="small" style={{ cursor: "pointer" }}>
                <FiUser aria-hidden />
                <span className="zion-header__account-label">
                  {isLoading ? "" : isAuthenticated ? user?.displayName ?? user?.email : "Tài khoản"}
                </span>
              </Flex>
            </Dropdown>
          </Flex>
        </Flex>
        <div className="zion-header__category-row">
          {categoriesLoading ? (
            <div style={{ padding: "8px 16px", color: "var(--color-muted)", fontSize: 13 }}>Đang tải danh mục...</div>
          ) : (
            <Menu
              mode="horizontal"
              items={toMenuItems(categories ?? [])}
              style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}
            />
          )}
        </div>
      </header>
      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <MobileSearchOverlay open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
      <style>{`
        @media (max-width: 1023px) {
          .zion-header__hamburger { display: inline-flex !important; }
          .zion-header__search-trigger { display: inline-flex !important; }
          .zion-header__search-inline { display: none; }
          .zion-header__category-row { display: none; }
          .zion-header__account-label { display: none; }
        }
      `}</style>
    </>
  );
}
