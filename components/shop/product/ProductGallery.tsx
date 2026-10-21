"use client";

import { useState } from "react";
import { Image, Space } from "antd";
import type { ProductImageDto } from "@/types/products";

interface ProductGalleryProps {
  images: ProductImageDto[];
  name: string;
  activeOverrideUrl?: string | null;
}

export default function ProductGallery({ images, name, activeOverrideUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const normalizedOverrideUrl = activeOverrideUrl ?? null;
  const [lastSeenOverrideUrl, setLastSeenOverrideUrl] = useState(normalizedOverrideUrl);

  if (normalizedOverrideUrl !== lastSeenOverrideUrl) {
    setLastSeenOverrideUrl(normalizedOverrideUrl);
    setManualUrl(null);
  }

  const overrideUrl = manualUrl ? null : normalizedOverrideUrl;
  const active = overrideUrl ? { id: "variant-image", url: overrideUrl, alt: name, displayOrder: -1 } : images[activeIndex];

  function handleSelectThumbnail(index: number) {
    setActiveIndex(index);
    setManualUrl(images[index]?.url ?? null);
  }

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
              aria-pressed={!overrideUrl && index === activeIndex}
              onClick={() => handleSelectThumbnail(index)}
              style={{
                cursor: "pointer",
                padding: 0,
                lineHeight: 0,
                background: "none",
                border: !overrideUrl && index === activeIndex ? "2px solid var(--color-action)" : "2px solid transparent",
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
