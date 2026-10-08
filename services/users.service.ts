import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import type { AddAddressRequest, AddressDto, UpdateAddressRequest, UpdateProfileRequest, UserProfileDto } from "@/types/users";

export const usersService = {
  getMe: () => apiGet<UserProfileDto>("/api/v1/users/me").then((r) => r.data),

  updateMe: (body: UpdateProfileRequest) =>
    apiPut<UserProfileDto>("/api/v1/users/me", body).then((r) => r.data),

  listAddresses: () => apiGet<AddressDto[]>("/api/v1/users/me/addresses").then((r) => r.data),

  addAddress: (body: AddAddressRequest) =>
    apiPost<AddressDto>("/api/v1/users/me/addresses", body).then((r) => r.data),

  updateAddress: (addressId: string, body: UpdateAddressRequest) =>
    apiPut<AddressDto>(`/api/v1/users/me/addresses/${addressId}`, body).then((r) => r.data),

  removeAddress: (addressId: string) =>
    apiDelete<null>(`/api/v1/users/me/addresses/${addressId}`).then(() => undefined),

  setDefaultAddress: (addressId: string) =>
    apiPost<AddressDto>(`/api/v1/users/me/addresses/${addressId}/default`).then((r) => r.data),
};
