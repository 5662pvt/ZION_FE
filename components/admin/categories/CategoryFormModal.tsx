"use client";

import { useEffect, useRef } from "react";
import { Form, Input, InputNumber, Modal } from "antd";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useAdminCategories";
import type { CategoryTreeNodeDto } from "@/types/categories";

interface CategoryFormValues {
  name: string;
  slug?: string;
  description?: string;
  displayOrder: number;
}

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  category?: CategoryTreeNodeDto | null;
  parent?: CategoryTreeNodeDto | null;
  onClose: () => void;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoryFormModal({ open, mode, category, parent, onClose }: CategoryFormModalProps) {
  const [form] = Form.useForm<CategoryFormValues>();
  const slugTouchedRef = useRef(false);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const submitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    slugTouchedRef.current = false;
    if (mode === "edit" && category) {
      form.setFieldsValue({
        name: category.name,
        displayOrder: category.displayOrder,
        description: category.description ?? undefined,
      });
    } else {
      form.setFieldsValue({ name: "", slug: "", description: undefined, displayOrder: 0 });
    }
  }, [open, mode, category, form]);

  const handleNameChange = (name: string) => {
    if (mode === "create" && !slugTouchedRef.current) {
      form.setFieldValue("slug", slugify(name));
    }
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          slug: (values.slug ?? "").trim(),
          parentId: parent?.id ?? null,
          description: values.description?.trim() || null,
          displayOrder: values.displayOrder,
        });
        toast.success("Tạo danh mục thành công");
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          body: {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            displayOrder: values.displayOrder,
          },
        });
        toast.success("Cập nhật danh mục thành công");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Thêm danh mục" : "Sửa danh mục"}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnHidden
      okText={mode === "create" ? "Tạo" : "Lưu"}
      cancelText="Hủy"
    >
      {mode === "create" && (
        <p style={{ color: "var(--color-muted)", marginBottom: 16 }}>
          Danh mục cha: {parent ? parent.name : "(không có — danh mục gốc)"}
        </p>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={submitting} requiredMark={false}>
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }, { max: mode === "create" ? 128 : 200 }]}
        >
          <Input onChange={(e) => handleNameChange(e.target.value)} placeholder="Ví dụ: Điện thoại" />
        </Form.Item>
        {mode === "create" && (
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: "Vui lòng nhập slug" },
              { max: 128 },
              { pattern: /^[a-z0-9-]+$/, message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang" },
            ]}
          >
            <Input onChange={() => (slugTouchedRef.current = true)} placeholder="vi-du" />
          </Form.Item>
        )}
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả danh mục (không bắt buộc)" />
        </Form.Item>
        <Form.Item
          name="displayOrder"
          label="Thứ tự hiển thị"
          rules={[{ required: true, message: "Vui lòng nhập thứ tự hiển thị" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
