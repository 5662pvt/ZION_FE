export interface GiftPreviewDto {
  promotionId: string;
  promotionName: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  available: boolean;
}
