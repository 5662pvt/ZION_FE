export interface ProductImageDto {
  id: string;
  url: string;
  alt: string | null;
  displayOrder: number;
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
