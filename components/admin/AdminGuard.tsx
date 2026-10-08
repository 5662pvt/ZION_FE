"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Result, Spin } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

function AdminGuardFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
      <Spin size="large" />
    </div>
  );
}

function AdminGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const search = searchParams.toString();
      const currentUrl = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, searchParams]);

  if (isLoading || !isAuthenticated) {
    return <AdminGuardFallback />;
  }

  if (!hasRole(ROLES.Admin, ROLES.Staff)) {
    return <Result status="403" title="403" subTitle="Bạn không có quyền truy cập trang này." />;
  }

  return <>{children}</>;
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminGuardFallback />}>
      <AdminGuardInner>{children}</AdminGuardInner>
    </Suspense>
  );
}
