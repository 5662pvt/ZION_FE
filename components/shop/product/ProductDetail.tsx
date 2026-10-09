import { Space, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import AddToCartButton from "@/components/shop/AddToCartButton";
import type { ProductDto } from "@/types/products";

const { Title, Paragraph, Text } = Typography;

interface ProductDetailProps {
  product: ProductDto;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div>
      <Title level={2}>{product.name}</Title>
      <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
        {product.brand && <Text type="secondary">Thương hiệu: {product.brand}</Text>}
        {product.categoryName && <Text type="secondary">Danh mục: {product.categoryName}</Text>}
      </Space>
      <Title level={3} style={{ color: "#f5222d" }}>
        {formatVnd(product.price)}
      </Title>
      {product.description && <Paragraph>{product.description}</Paragraph>}
      <AddToCartButton productId={product.id} withQuantity />
    </div>
  );
}
