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
