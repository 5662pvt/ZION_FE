export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  displayOrder: number;
}

export interface CategoryTreeNodeDto {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  children: CategoryTreeNodeDto[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  displayOrder: number;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  displayOrder: number;
}
