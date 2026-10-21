export interface GiftPreviewDto {
  promotionId: string;
  promotionName: string;
  productId: string;
  variantId: string;
  variantLabel: string | null;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  available: boolean;
}
