import type { ReactNode } from "react";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFooter from "@/components/shop/ShopFooter";
import BottomTabBar from "@/components/shop/layout/BottomTabBar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ShopHeader />
      <main
        className="zion-shop-main"
        style={{
          minHeight: "60vh",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--space-4) 16px",
        }}
      >
        {children}
      </main>
      <ShopFooter />
      <BottomTabBar />
      <style>{`
        @media (min-width: 640px) {
          .zion-shop-main { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 1023px) {
          .zion-shop-main { padding-bottom: 80px; }
        }
      `}</style>
    </>
  );
}
