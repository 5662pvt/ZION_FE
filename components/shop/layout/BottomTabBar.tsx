"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiHome, FiList, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import CartBadge from "@/components/shop/CartBadge";
import NotificationBell from "@/components/shop/NotificationBell";
import MobileNavDrawer from "./MobileNavDrawer";

function tabStyle(active: boolean): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 44,
    minHeight: 44,
    padding: "4px 8px",
    fontSize: 11,
    color: active ? "var(--color-action)" : "var(--color-muted)",
    background: "none",
    border: "none",
    cursor: "pointer",
  };
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const isHome = pathname === "/";
  const isCart = pathname.startsWith("/cart");
  const isOrders = pathname.startsWith("/account/orders");
  const isAccount = pathname.startsWith("/account") && !isOrders;

  return (
    <>
      <nav
        className="zion-bottom-tab-bar"
        aria-label="Điều hướng chính"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <Link href="/" aria-label="Trang chủ" aria-current={isHome ? "page" : undefined} style={tabStyle(isHome)}>
          <FiHome size={20} aria-hidden />
          <span>Trang chủ</span>
        </Link>
        <button type="button" onClick={() => setCategoriesOpen(true)} aria-label="Danh mục" style={tabStyle(false)}>
          <FiGrid size={20} aria-hidden />
          <span>Danh mục</span>
        </button>
        <CartBadge variant="tab" active={isCart} />
        <NotificationBell variant="tab" active={pathname.startsWith("/account/notifications")} />
        <Link
          href="/account/orders"
          aria-label="Đơn hàng"
          aria-current={isOrders ? "page" : undefined}
          style={tabStyle(isOrders)}
        >
          <FiList size={20} aria-hidden />
          <span>Đơn hàng</span>
        </Link>
        <Link
          href={isAuthenticated ? "/account" : "/login"}
          aria-label="Tài khoản"
          aria-current={isAccount ? "page" : undefined}
          style={tabStyle(isAccount)}
        >
          <FiUser size={20} aria-hidden />
          <span>Tài khoản</span>
        </Link>
      </nav>
      <MobileNavDrawer open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <style>{`
        .zion-bottom-tab-bar {
          display: flex;
          justify-content: space-around;
        }
        @media (min-width: 1024px) {
          .zion-bottom-tab-bar { display: none; }
        }
      `}</style>
    </>
  );
}
