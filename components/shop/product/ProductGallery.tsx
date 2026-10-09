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
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div style={{ width: "100%", height: 400, background: "#f5f5f5" }} />
      )}
      {images.length > 1 && (
        <Space style={{ marginTop: 12 }} wrap>
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => setActiveIndex(index)}
              style={{
                cursor: "pointer",
                border: index === activeIndex ? "2px solid #1677ff" : "2px solid transparent",
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
            </div>
          ))}
        </Space>
      )}
    </div>
  );
}
