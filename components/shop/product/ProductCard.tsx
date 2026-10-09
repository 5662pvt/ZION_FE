import Link from "next/link";
import { Card, Image } from "antd";
import { formatVnd } from "@/utils/money";
import type { ProductSummaryDto } from "@/types/products";

interface ProductCardProps {
  product: ProductSummaryDto;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        hoverable
        styles={{ body: { padding: 12 } }}
        cover={
          product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              preview={false}
              height={200}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ height: 200, background: "#f5f5f5" }} />
          )
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
