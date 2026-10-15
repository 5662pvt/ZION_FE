"use client";

import { useState } from "react";
import { Button } from "antd";
import { useCategoryTree } from "@/hooks/useCategories";
import { useDeleteCategory } from "@/hooks/useAdminCategories";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import CategoryTreeTable from "@/components/admin/categories/CategoryTreeTable";
import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import type { CategoryTreeNodeDto } from "@/types/categories";

interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  category: CategoryTreeNodeDto | null;
  parent: CategoryTreeNodeDto | null;
}

const CLOSED_MODAL: ModalState = { open: false, mode: "create", category: null, parent: null };

export default function AdminCategoriesPage() {
  const { data, isLoading, isError, error, refetch } = useCategoryTree();
  const deleteMutation = useDeleteCategory();
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (category: CategoryTreeNodeDto) => {
    setDeletingId(category.id);
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("Xóa danh mục thành công");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể xóa danh mục");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Quản lý cây danh mục sản phẩm"
        action={
          <Button type="primary" onClick={() => setModal({ open: true, mode: "create", category: null, parent: null })}>
            Thêm danh mục
          </Button>
        }
      />

      {isError && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState
            message={error instanceof ApiError ? error.message : "Không tải được danh mục"}
            onRetry={() => void refetch()}
          />
        </div>
      )}

      <CategoryTreeTable
        data={data ?? []}
        loading={isLoading}
        deletingId={deletingId}
        onEdit={(category) => setModal({ open: true, mode: "edit", category, parent: null })}
        onAddChild={(parent) => setModal({ open: true, mode: "create", category: null, parent })}
        onDelete={handleDelete}
      />

      <CategoryFormModal
        open={modal.open}
        mode={modal.mode}
        category={modal.category}
        parent={modal.parent}
        onClose={() => setModal(CLOSED_MODAL)}
      />
    </div>
  );
}
