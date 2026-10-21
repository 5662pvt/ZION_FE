export interface AddressDto {
  id: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface UserProfileDto {
  id: string;
  authUserId: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  addresses: AddressDto[];
}

export interface UpdateProfileRequest {
  fullName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}

export interface AddAddressRequest {
  recipientName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export type UpdateAddressRequest = AddAddressRequest;

export interface WishlistItemDto {
  productId: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  inStock: boolean;
  addedAt: string;
  minPrice: number;
  maxPrice: number;
  variantCount: number;
}

export interface WishlistToggleResponse {
  productId: string;
  inWishlist: boolean;
}

export interface WishlistParams {
  page?: number;
  pageSize?: number;
}
