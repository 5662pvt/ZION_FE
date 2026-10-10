import Link from "next/link";
import { Card, Image, Tag } from "antd";
import { formatVnd } from "@/utils/money";
import type { ProductSummaryDto } from "@/types/products";

interface ProductCardProps {
  product: ProductSummaryDto;
  inStock?: boolean;
}

export default function ProductCard({ product, inStock }: ProductCardProps) {
  const outOfStock = inStock === false;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        hoverable
        styles={{ body: { padding: 12 } }}
        cover={
          <div style={{ position: "relative" }}>
            {product.primaryImageUrl ? (
              <Image
                src={product.primaryImageUrl}
                alt={product.name}
                preview={false}
                height={200}
                style={{ objectFit: "cover", filter: outOfStock ? "grayscale(1) opacity(0.6)" : undefined }}
              />
            ) : (
              <div style={{ height: 200, background: "#f5f5f5" }} />
            )}
            {outOfStock && (
              <Tag color="default" style={{ position: "absolute", top: 8, left: 8 }}>
                Hết hàng
              </Tag>
            )}
          </div>
        }
      >
        <Card.Meta
          title={product.name}
          description={<span style={{ color: "#f5222d", fontWeight: 600 }}>{formatVnd(product.price)}</span>}
        />
      </Card>
    </Link>
  );
}
