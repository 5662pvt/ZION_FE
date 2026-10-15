"use client";

import { useState } from "react";
import { Image, Space } from "antd";
import type { ProductImageDto } from "@/types/products";

interface ProductGalleryProps {
  images: ProductImageDto[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      {active ? (
        <Image
          src={active.url}
          alt={active.alt ?? name}
          width="100%"
          height={400}
          style={{ objectFit: "cover", borderRadius: "var(--radius-card)" }}
        />
      ) : (
        <div
          role="img"
          aria-label={`Chưa có hình ảnh cho ${name}`}
          style={{
            width: "100%",
            height: 400,
            background: "var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />
      )}
      {images.length > 1 && (
        <Space style={{ marginTop: 12 }} wrap>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Xem ảnh ${index + 1} của ${name}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              style={{
                cursor: "pointer",
                padding: 0,
                lineHeight: 0,
                background: "none",
                border: index === activeIndex ? "2px solid var(--color-action)" : "2px solid transparent",
                borderRadius: 4,
              }}
            >
              <Image
                src={image.url}
                alt={image.alt ?? name}
                width={64}
                height={64}
                preview={false}
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </Space>
      )}
    </div>
  );
}
