"use client";

import { Button } from "antd";
import { FiShoppingCart, FiZap } from "react-icons/fi";

interface StickyBuyBarProps {
  outOfStock?: boolean;
  isAdding: boolean;
  isBuyingNow: boolean;
  onAdd: () => void;
  onBuyNow: () => void;
}

export default function StickyBuyBar({
  outOfStock = false,
  isAdding,
  isBuyingNow,
  onAdd,
  onBuyNow,
}: StickyBuyBarProps) {
  const busy = isAdding || isBuyingNow;

  return (
    <>
      <div className="zion-sticky-buy-bar">
        <Button
          type="primary"
          size="large"
          icon={<FiShoppingCart aria-hidden />}
          disabled={outOfStock || busy}
          loading={isAdding}
          onClick={onAdd}
          style={{ flex: 1 }}
        >
          Thêm vào giỏ
        </Button>
        <Button
          size="large"
          icon={<FiZap aria-hidden />}
          disabled={outOfStock || busy}
          loading={isBuyingNow}
          onClick={onBuyNow}
          style={{ flex: 1 }}
        >
          Mua ngay
        </Button>
      </div>
      <div className="zion-sticky-buy-bar-spacer" />
      <style>{`
        .zion-sticky-buy-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: var(--bottom-nav-height, 56px);
          z-index: 99;
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
        }
        .zion-sticky-buy-bar-spacer {
          height: 76px;
        }
        @media (min-width: 1024px) {
          .zion-sticky-buy-bar,
          .zion-sticky-buy-bar-spacer {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
