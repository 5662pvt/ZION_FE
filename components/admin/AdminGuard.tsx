"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Result, Spin } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?returnUrl=/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hasRole(ROLES.Admin, ROLES.Staff)) {
    return <Result status="403" title="403" subTitle="Bạn không có quyền truy cập trang này." />;
  }

  return <>{children}</>;
}
