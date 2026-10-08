import type { ReactNode } from "react";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFooter from "@/components/shop/ShopFooter";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ShopHeader />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <ShopFooter />
    </>
  );
}
