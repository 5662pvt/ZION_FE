"use client";

import Link from "next/link";
import { Button, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function HeroSection() {
  return (
    <section className="hero">
      <div aria-hidden className="hero-shape hero-shape--teal" />
      <div aria-hidden className="hero-shape hero-shape--sky" />
      <div className="hero-content">
        <Title level={1} style={{ color: "#fff", marginBottom: 8 }}>
          Mua sắm thông minh tại ZIONShop
        </Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, marginBottom: 24 }}>
          Hàng ngàn sản phẩm chính hãng, giá tốt mỗi ngày.
        </Paragraph>
        <Link href="/products">
          <Button type="primary" size="large">
            Khám phá sản phẩm
          </Button>
        </Link>
      </div>
      <style jsx>{`
        .hero {
          position: relative;
          overflow: hidden;
          background: var(--color-primary);
          text-align: center;
          padding: 40px 16px;
        }
        @media (min-width: 640px) {
          .hero {
            padding: 56px 24px;
          }
        }
        .hero-content {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-shape--teal {
          top: -60px;
          right: -60px;
          width: 220px;
          height: 220px;
          background: var(--color-action);
          opacity: 0.18;
        }
        .hero-shape--sky {
          bottom: -80px;
          left: -40px;
          width: 180px;
          height: 180px;
          background: var(--color-accent);
          opacity: 0.12;
        }
      `}</style>
    </section>
  );
}
