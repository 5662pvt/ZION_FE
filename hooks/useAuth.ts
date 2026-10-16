"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { setAccessToken, setRefreshToken } from "@/utils/authStorage";
import type { ChangePasswordRequest } from "@/types/auth";

export { useAuthContext as useAuth } from "@/components/common/AuthProvider";

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => authService.changePassword(body),
    onSuccess: (token) => {
      setAccessToken(token.accessToken);
      setRefreshToken(token.refreshToken);
    },
  });
}
