"use client";

import { useEffect, useMemo, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, InputNumber, Select, TreeSelect, type FormProps } from "antd";
import { mapCategoryTree } from "@/components/admin/products/categoryTreeData";
import { useCategoryTree } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { slugify } from "@/utils/slugify";
import type { ProductDto } from "@/types/products";

interface ProductFormValues {
  name: string;
  slug?: string;
  sku?: string;
  price: number;
  currency: string;
  categoryId?: string;
  brand?: string;
  description?: string;
}

const FIELD_NAMES: (keyof ProductFormValues)[] = [
  "name",
  "slug",
  "sku",
  "price",
  "currency",
  "categoryId",
  "brand",
  "description",
];

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductDto;
}

export default function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<ProductFormValues>();
  const { data: categoryTree } = useCategoryTree();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const slugTouchedRef = useRef(false);

  const treeData = useMemo(() => mapCategoryTree(categoryTree ?? []), [categoryTree]);

  useEffect(() => {
    if (mode === "edit" && product) {
      form.setFieldsValue({
        name: product.name,
        price: product.price,
        currency: product.currency,
        categoryId: product.categoryId ?? undefined,
        brand: product.brand ?? undefined,
        description: product.description ?? undefined,
      });
    }
  }, [mode, product, form]);

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (mode === "create" && !slugTouchedRef.current) {
      form.setFieldValue("slug", slugify(e.target.value));
    }
  }

  function handleSlugChange() {
    slugTouchedRef.current = true;
  }

  function applyFieldErrors(err: ApiError): boolean {
    if (!err.errors || err.errors.length === 0) return false;
    const fields = err.errors
      .map((e) => {
        const match = FIELD_NAMES.find((f) => f.toLowerCase() === (e.field ?? "").toLowerCase());
        if (!match) {
          toast.error(e.message);
          return null;
        }
        return { name: match, errors: [e.message] };
      })
      .filter((f): f is { name: keyof ProductFormValues; errors: string[] } => f !== null);
    if (fields.length === 0) return false;
    form.setFields(fields);
    return true;
  }

  const handleSubmit: FormProps<ProductFormValues>["onFinish"] = async (values) => {
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync({
          name: values.name,
          slug: values.slug ?? slugify(values.name),
          sku: values.sku ?? "",
          price: values.price,
          currency: values.currency,
          categoryId: values.categoryId ?? null,
          description: values.description ?? null,
          brand: values.brand ?? null,
        });
        toast.success("Đã tạo sản phẩm");
        router.push(`/admin/products/${created.id}/edit`);
      } else if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          body: {
            name: values.name,
            description: values.description ?? null,
            price: values.price,
            currency: values.currency,
            categoryId: values.categoryId ?? null,
            brand: values.brand ?? null,
          },
        });
        toast.success("Đã lưu thay đổi");
      }
    } catch (err) {
      if (err instanceof ApiError && applyFieldErrors(err)) return;
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Form<ProductFormValues> form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ currency: "VND" }}>
      <Form.Item
        label="Tên sản phẩm"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }, { max: 256, message: "Tối đa 256 ký tự" }]}
      >
        <Input onChange={handleNameChange} />
      </Form.Item>

      {mode === "create" ? (
        <>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: "Vui lòng nhập slug" },
              { max: 256, message: "Tối đa 256 ký tự" },
              { pattern: /^[a-z0-9-]+$/, message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang" },
            ]}
          >
            <Input onChange={handleSlugChange} />
          </Form.Item>
          <Form.Item
            label="SKU"
            name="sku"
            rules={[
              { required: true, message: "Vui lòng nhập SKU" },
              { min: 3, message: "Tối thiểu 3 ký tự" },
              { max: 64, message: "Tối đa 64 ký tự" },
            ]}
          >
            <Input />
          </Form.Item>
        </>
      ) : (
        product && (
          <>
            <Form.Item label="Slug">
              <Input value={product.slug} disabled />
            </Form.Item>
            <Form.Item label="SKU">
              <Input value={product.sku} disabled />
            </Form.Item>
          </>
        )
      )}

      <div style={{ display: "flex", gap: 16 }}>
        <Form.Item
          label="Giá"
          name="price"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Vui lòng nhập giá" }]}
        >
          <InputNumber<number>
            min={0}
            step={1000}
            style={{ width: "100%" }}
            formatter={(value) => (value !== undefined && value !== null ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
            parser={(value) => (value ? Number(value.replace(/[^\d]/g, "")) : 0)}
          />
        </Form.Item>
        <Form.Item
          label="Đơn vị"
          name="currency"
          style={{ width: 140 }}
          rules={[{ required: true, message: "Chọn đơn vị" }]}
        >
          <Select
            options={[
              { value: "VND", label: "VND" },
              { value: "USD", label: "USD" },
            ]}
          />
        </Form.Item>
      </div>

      <Form.Item label="Danh mục" name="categoryId">
        <TreeSelect allowClear placeholder="Chọn danh mục" treeData={treeData} />
      </Form.Item>

      <Form.Item label="Thương hiệu" name="brand" rules={[{ max: 128, message: "Tối đa 128 ký tự" }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
          {mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
        </Button>
      </Form.Item>
    </Form>
  );
}
