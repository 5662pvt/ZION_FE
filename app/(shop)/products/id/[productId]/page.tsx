"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin } from "antd";
import { productsService } from "@/services/products.service";
import { ApiError } from "@/services/apiClient";

interface ProductByIdRedirectPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductByIdRedirectPage({ params }: ProductByIdRedirectPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const { data: product, error } = useQuery({
    queryKey: ["products", "byId", productId],
    queryFn: () => productsService.getById(productId),
  });

  useEffect(() => {
    if (product) router.replace(`/products/${product.slug}#reviews`);
  }, [product, router]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Alert type="error" message={error instanceof ApiError ? error.message : "Không tải được sản phẩm"} showIcon />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 48 }}>
      <Spin size="large" />
    </div>
  );
}
