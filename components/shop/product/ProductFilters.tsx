"use client";

import { InputNumber, Select, Space, TreeSelect, type TreeSelectProps } from "antd";
import { useCategoryTree } from "@/hooks/useCategories";
import { useIsClient } from "@/hooks/useIsClient";
import type { CategoryTreeNodeDto } from "@/types/categories";

export const SORT_OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

type TreeNode = NonNullable<TreeSelectProps["treeData"]>[number];

function mapCategoryTree(nodes: CategoryTreeNodeDto[]): TreeNode[] {
  return nodes.map((node) => ({
    title: node.name,
    value: node.id,
    key: node.id,
    children: node.children.length > 0 ? mapCategoryTree(node.children) : undefined,
  }));
}

export interface ProductFiltersValue {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFiltersProps {
  value: ProductFiltersValue;
  onChange: (next: Partial<ProductFiltersValue>) => void;
}

export default function ProductFilters({ value, onChange }: ProductFiltersProps) {
  const { data: categoryTree, isLoading: categoriesLoading } = useCategoryTree();
  const treeData = mapCategoryTree(categoryTree ?? []);
  const isClient = useIsClient();

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <label htmlFor="product-filter-category" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Danh mục
        </label>
        {isClient ? (
          <TreeSelect
            id="product-filter-category"
            allowClear
            placeholder="Tất cả danh mục"
            style={{ width: "100%" }}
            loading={categoriesLoading}
            treeData={treeData}
            value={value.categoryId}
            onChange={(categoryId) => onChange({ categoryId })}
          />
        ) : (
          <Select disabled placeholder="Danh mục" style={{ width: "100%" }} />
        )}
      </div>
      <div>
        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Khoảng giá</span>
        <Space.Compact style={{ width: "100%" }}>
          <InputNumber
            aria-label="Giá từ"
            placeholder="Giá từ"
            min={0}
            style={{ width: "50%" }}
            value={value.minPrice}
            onChange={(minPrice) => onChange({ minPrice: minPrice ?? undefined })}
          />
          <InputNumber
            aria-label="Giá đến"
            placeholder="Giá đến"
            min={0}
            style={{ width: "50%" }}
            value={value.maxPrice}
            onChange={(maxPrice) => onChange({ maxPrice: maxPrice ?? undefined })}
          />
        </Space.Compact>
      </div>
    </Space>
  );
}
