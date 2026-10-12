import { Space, Tag, Typography } from "antd";
import { formatVnd } from "@/utils/money";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductReviews from "@/components/shop/reviews/ProductReviews";
import { useProductAvailability } from "@/hooks/useAvailability";
import type { ProductDto } from "@/types/products";

const { Title, Paragraph, Text } = Typography;

interface ProductDetailProps {
  product: ProductDto;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { data: availability } = useProductAvailability(product.id);
  const inStock = availability?.inStock;
  const available = availability?.available;

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
      {inStock !== undefined && (
        <div style={{ marginBottom: 16 }}>
          {!inStock ? (
            <Tag color="red">Hết hàng</Tag>
          ) : available !== undefined && available <= 5 ? (
            <Tag color="orange">Chỉ còn {available} sản phẩm</Tag>
          ) : (
            <Tag color="green">Còn hàng</Tag>
          )}
        </div>
      )}
      {product.description && <Paragraph>{product.description}</Paragraph>}
      <AddToCartButton productId={product.id} withQuantity disabled={inStock === false} max={available} />
      <ProductReviews productId={product.id} />
    </div>
  );
}
