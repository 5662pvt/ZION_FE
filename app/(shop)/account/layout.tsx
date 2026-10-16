"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Col, Menu, Row } from "antd";
import RequireAuth from "@/components/common/RequireAuth";

const MENU_ITEMS = [
  { key: "/account", label: "Hồ sơ" },
  { key: "/account/addresses", label: "Sổ địa chỉ" },
  { key: "/account/orders", label: "Đơn hàng" },
  { key: "/account/wishlist", label: "Yêu thích" },
  { key: "/account/notifications", label: "Thông báo" },
  { key: "/account/reviews", label: "Đánh giá của tôi" },
  { key: "/account/security", label: "Bảo mật" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <RequireAuth>
      <Row gutter={24} style={{ padding: "24px 16px" }}>
        <Col xs={24} md={6} style={{ marginBottom: 16 }}>
          <Menu mode="vertical" selectedKeys={[pathname]} items={MENU_ITEMS} onClick={({ key }) => router.push(key)} />
        </Col>
        <Col xs={24} md={18}>
          {children}
        </Col>
      </Row>
    </RequireAuth>
  );
}
