export interface ProductImageDto {
  id: string;
  url: string;
  alt: string | null;
  displayOrder: number;
}

export interface ProductOptionDto {
  name: string;
  values: string[];
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  price: number;
  currency: string;
  option1Value: string | null;
  option2Value: string | null;
  label: string;
  imageId: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  currency: string;
  status: string;
  categoryId: string | null;
  categoryName: string | null;
  brand: string | null;
  images: ProductImageDto[];
  options: ProductOptionDto[];
  variants: ProductVariantDto[];
  minPrice: number;
  maxPrice: number;
}

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  status: string;
  categoryName: string | null;
  primaryImageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  variantCount: number;
}

export interface ProductSuggestionDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  variantCount: number;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export type ProductStatus = "Draft" | "Published" | "Archived";

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  status?: ProductStatus;
}

export interface CreateProductImageRequest {
  url: string;
  alt?: string | null;
  displayOrder: number;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  categoryId?: string | null;
  description?: string | null;
  brand?: string | null;
  images?: CreateProductImageRequest[] | null;
}

export interface UpdateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  categoryId?: string | null;
  brand?: string | null;
}

export interface SetVariantsOptionRequest {
  name: string;
  values: string[];
}

export interface SetVariantsVariantRequest {
  id?: string;
  option1Value?: string | null;
  option2Value?: string | null;
  sku: string;
  price: number;
  currency: string;
  isActive: boolean;
  imageId?: string | null;
}

export interface SetVariantsRequest {
  options: SetVariantsOptionRequest[];
  variants: SetVariantsVariantRequest[];
}
