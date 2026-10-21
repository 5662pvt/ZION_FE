"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AutoComplete, Image, Input, Spin } from "antd";
import { FiSearch } from "react-icons/fi";
import { useProductSuggest } from "@/hooks/useProducts";
import { formatVnd } from "@/utils/money";
import type { ProductSuggestionDto } from "@/types/products";

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

interface SearchAutocompleteProps {
  autoFocus?: boolean;
  placeholder?: string;
  onNavigate?: () => void;
}

export default function SearchAutocomplete({
  autoFocus,
  placeholder = "Tìm sản phẩm...",
  onNavigate,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") ?? "");
  const debouncedKeyword = useDebouncedValue(keyword, 250);
  const trimmed = debouncedKeyword.trim();

  const { data: suggestions, isFetching } = useProductSuggest(trimmed);

  const goToSearch = (value: string) => {
    const kw = value.trim();
    router.push(kw ? `/products?keyword=${encodeURIComponent(kw)}` : "/products");
    onNavigate?.();
  };

  const goToProduct = (item: ProductSuggestionDto) => {
    router.push(`/products/${item.slug}`);
    onNavigate?.();
  };

  const options = useMemo(() => {
    if (trimmed.length < 2) return [];

    if (isFetching && !suggestions) {
      return [
        {
          value: "__loading__",
          disabled: true,
          label: <Spin size="small" />,
        },
      ];
    }

    if (suggestions && suggestions.length === 0) {
      return [
        {
          value: "__view_all__",
          label: (
            <span style={{ color: "var(--color-muted)" }}>
              {`Không tìm thấy sản phẩm cho '${trimmed}'. `}
              <span style={{ color: "var(--color-action)" }}>Xem tất cả sản phẩm</span>
            </span>
          ),
        },
      ];
    }

    return (suggestions ?? []).map((item) => ({
      value: item.id,
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              width={32}
              height={32}
              preview={false}
              style={{ objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <span
              aria-hidden
              style={{ width: 32, height: 32, borderRadius: 4, background: "var(--color-border)", flexShrink: 0 }}
            />
          )}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.name}
          </span>
          <span style={{ color: "var(--color-muted)", fontSize: 13, flexShrink: 0 }}>
            {item.minPrice === item.maxPrice ? formatVnd(item.minPrice) : `${formatVnd(item.minPrice)} – ${formatVnd(item.maxPrice)}`}
          </span>
        </span>
      ),
    }));
  }, [trimmed, suggestions, isFetching]);

  return (
    <AutoComplete
      style={{ width: "100%" }}
      value={keyword}
      options={options}
      popupMatchSelectWidth
      onChange={setKeyword}
      onSelect={(value) => {
        if (value === "__loading__") return;
        if (value === "__view_all__") {
          goToSearch("");
          return;
        }
        const item = suggestions?.find((s) => s.id === value);
        if (item) goToProduct(item);
      }}
    >
      <Input.Search
        autoFocus={autoFocus}
        placeholder={placeholder}
        allowClear
        enterButton={<FiSearch aria-hidden />}
        onSearch={goToSearch}
        aria-label="Tìm sản phẩm"
      />
    </AutoComplete>
  );
}
