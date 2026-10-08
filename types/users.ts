export interface AddressDto {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string;
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
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export type UpdateAddressRequest = AddAddressRequest;
