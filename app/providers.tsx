"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState, type ReactNode } from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/components/common/AuthProvider";
import { ApiError } from "@/services/apiClient";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: "#1677ff" } }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
