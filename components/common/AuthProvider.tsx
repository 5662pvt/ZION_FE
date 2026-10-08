"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { cartService } from "@/services/cart.service";
import { clearAuthStorage, getRefreshToken, onAuthCleared, setAccessToken, setRefreshToken } from "@/utils/authStorage";
import { queryKeys } from "@/constants/queryKeys";
import { hasAnyRole, type Role } from "@/constants/roles";
import type { AuthUserDto } from "@/types/auth";

interface AuthContextValue {
  user: AuthUserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        const token = await authService.refresh({ refreshToken });
        setAccessToken(token.accessToken);
        setRefreshToken(token.refreshToken);
        const me = await authService.me();
        if (active) setUser(me);
      } catch {
        clearAuthStorage();
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onAuthCleared(() => setUser(null)), []);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await authService.login({ email, password });
      setAccessToken(token.accessToken);
      setRefreshToken(token.refreshToken);
      const me = await authService.me();
      setUser(me);
      try {
        await cartService.mergeGuestCart();
      } catch {
        // guest cart merge failure should not block login
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authService.revoke({ refreshToken });
      } catch {
        // best-effort revoke; proceed with local cleanup regardless
      }
    }
    clearAuthStorage();
    setUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.me });
    queryClient.removeQueries({ queryKey: queryKeys.addresses });
    queryClient.removeQueries({ queryKey: queryKeys.cart });
  }, [queryClient]);

  const hasRole = useCallback((...roles: Role[]) => hasAnyRole(user?.roles, roles), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout, hasRole }),
    [user, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
