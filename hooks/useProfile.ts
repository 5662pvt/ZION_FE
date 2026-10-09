"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { queryKeys } from "@/constants/queryKeys";
import type { UpdateProfileRequest } from "@/types/users";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: usersService.getMe,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => usersService.updateMe(body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
    },
  });
}
