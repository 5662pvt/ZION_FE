"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/hooks/useAuth";

function RequireAuthFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
      <Spin size="large" />
    </div>
  );
}

function RequireAuthInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const search = searchParams.toString();
      const currentUrl = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, searchParams]);

  if (isLoading || !isAuthenticated) {
    return <RequireAuthFallback />;
  }

  return <>{children}</>;
}

export default function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RequireAuthFallback />}>
      <RequireAuthInner>{children}</RequireAuthInner>
    </Suspense>
  );
}
