"use client";

import type { CSSProperties, MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "antd";
import { FiHeart } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useAddToWishlist, useRemoveFromWishlist, useWishlistIds } from "@/hooks/useWishlist";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";

interface WishlistButtonProps {
  productId: string;
  size?: "small" | "middle" | "large";
  style?: CSSProperties;
}

export default function WishlistButton({ productId, size = "middle", style }: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: ids } = useWishlistIds();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const inWishlist = isAuthenticated && !!ids?.includes(productId);
  const busy = addMutation.isPending || removeMutation.isPending;

  function handleClick(e: MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (inWishlist) {
      removeMutation.mutate(productId, {
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Bỏ khỏi yêu thích thất bại"),
      });
    } else {
      addMutation.mutate(productId, {
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Thêm vào yêu thích thất bại"),
      });
    }
  }

  return (
    <Button
      shape="circle"
      size={size}
      icon={
        <FiHeart
          aria-hidden
          fill={inWishlist ? "currentColor" : "none"}
          style={{ color: inWishlist ? "var(--color-danger)" : undefined }}
        />
      }
      aria-pressed={inWishlist}
      aria-label={inWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      loading={busy}
      onClick={handleClick}
      style={style}
    />
  );
}
