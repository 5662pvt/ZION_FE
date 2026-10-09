"use client";

import { InputNumber, Select, Space, TreeSelect, type TreeSelectProps } from "antd";
import { useCategoryTree } from "@/hooks/useCategories";
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
  sort?: string;
}

interface ProductFiltersProps {
  value: ProductFiltersValue;
  onChange: (next: Partial<ProductFiltersValue>) => void;
}

export default function ProductFilters({ value, onChange }: ProductFiltersProps) {
  const { data: categoryTree, isLoading: categoriesLoading } = useCategoryTree();
  const treeData = mapCategoryTree(categoryTree ?? []);

  return (
    <Space wrap>
      <TreeSelect
        allowClear
        placeholder="Danh mục"
        style={{ width: 220 }}
        loading={categoriesLoading}
        treeData={treeData}
        value={value.categoryId}
        onChange={(categoryId) => onChange({ categoryId })}
      />
      <InputNumber
        placeholder="Giá từ"
        min={0}
        style={{ width: 140 }}
        value={value.minPrice}
        onChange={(minPrice) => onChange({ minPrice: minPrice ?? undefined })}
      />
      <InputNumber
        placeholder="Giá đến"
        min={0}
        style={{ width: 140 }}
        value={value.maxPrice}
        onChange={(maxPrice) => onChange({ maxPrice: maxPrice ?? undefined })}
      />
      <Select
        style={{ width: 180 }}
        options={SORT_OPTIONS}
        value={value.sort ?? ""}
        onChange={(sort) => onChange({ sort: sort || undefined })}
      />
    </Space>
  );
}
