import type { TreeSelectProps } from "antd";
import type { CategoryTreeNodeDto } from "@/types/categories";

export type CategoryTreeSelectNode = NonNullable<TreeSelectProps["treeData"]>[number];

export function mapCategoryTree(nodes: CategoryTreeNodeDto[]): CategoryTreeSelectNode[] {
  return nodes.map((node) => ({
    title: node.name,
    value: node.id,
    key: node.id,
    children: node.children.length > 0 ? mapCategoryTree(node.children) : undefined,
  }));
}
