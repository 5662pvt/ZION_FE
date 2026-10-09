"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AddAddressRequest, UpdateAddressRequest } from "@/types/users";

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: usersService.listAddresses,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddAddressRequest) => usersService.addAddress(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, body }: { addressId: string; body: UpdateAddressRequest }) =>
      usersService.updateAddress(addressId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useRemoveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => usersService.removeAddress(addressId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => usersService.setDefaultAddress(addressId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}
