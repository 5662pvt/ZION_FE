"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variant");
  const { data: product, error } = useQuery({
    queryKey: ["products", "byId", productId],
    queryFn: () => productsService.getById(productId),
  });

  useEffect(() => {
    if (!product) return;
    const suffix = variantId ? `?variant=${encodeURIComponent(variantId)}` : "#reviews";
    router.replace(`/products/${product.slug}${suffix}`);
  }, [product, router, variantId]);

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
