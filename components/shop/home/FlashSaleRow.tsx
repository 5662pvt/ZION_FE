"use client";

import Link from "next/link";
import { Card, Image, Progress, Typography } from "antd";
import { useActiveFlashSales } from "@/hooks/useFlashSales";
import FlashSaleCountdown from "@/components/shop/home/FlashSaleCountdown";
import Price from "@/components/ui/Price";
import type { ActiveFlashSaleItemDto } from "@/types/flashSales";

const { Title } = Typography;

export default function FlashSaleRow() {
  const { data } = useActiveFlashSales();

  const items: ActiveFlashSaleItemDto[] = (data ?? []).flatMap((flashSale) => flashSale.items).filter((item) => item.available > 0);

  if (items.length === 0) return null;

  const nearestEndsAt = items.reduce((min, item) => (item.endsAt < min ? item.endsAt : min), items[0].endsAt);

  return (
    <section className="home-section home-section--sky">
      <div className="home-container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            ⚡ Flash Sale
          </Title>
          <FlashSaleCountdown endsAt={nearestEndsAt} />
        </div>

        <div className="flash-sale-row">
          {items.map((item) => (
            <Link key={item.variantId} href={`/products/id/${item.productId}?variant=${item.variantId}`}>
              <Card
                hoverable
                styles={{ body: { padding: 12 } }}
                cover={
                  <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", background: "var(--color-border)" }}>
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        preview={false}
                        wrapperStyle={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                }
              >
                <Card.Meta
                  title={
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "normal",
                        lineHeight: 1.25,
                        minHeight: 40,
                      }}
                    >
                      {item.productName}
                    </span>
                  }
                  description={
                    <>
                      {item.variantLabel && (
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Phân loại: {item.variantLabel}</div>
                      )}
                      <Price value={item.flashPrice} oldValue={item.regularPrice} />
                      <div style={{ marginTop: 8 }}>
                        <Progress
                          percent={Math.round(((item.allocatedQuantity - item.available) / item.allocatedQuantity) * 100)}
                          size="small"
                          showInfo={false}
                          strokeColor="var(--color-danger)"
                        />
                        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Còn {item.available} suất</span>
                      </div>
                    </>
                  }
                />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .home-section {
          padding: 32px 16px;
        }
        .home-section--sky {
          background: var(--color-accent);
        }
        .home-container {
          max-width: var(--content-max);
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .home-section {
            padding: 48px 24px;
          }
        }
        .flash-sale-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        :global(.flash-sale-row > *) {
          min-width: 0;
        }
        @media (min-width: 640px) {
          .flash-sale-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .flash-sale-row {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}
