"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Form, InputNumber, Select, Spin, Table, type TableProps } from "antd";
import { useAddFlashSaleItem } from "@/hooks/useAdminFlashSales";
import { productsService } from "@/services/products.service";
import { ApiError } from "@/services/apiClient";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import type { AddFlashSaleItemRequest, FlashSaleItemDto } from "@/types/flashSales";

function productLabel(product: { name: string; sku: string }): string {
  return `${product.name} (${product.sku})`;
}

function variantLabel(variant: { label: string; sku: string; price: number }): string {
  return `${variant.label} — ${variant.sku} — ${formatVnd(variant.price)}`;
}

interface AddItemFormValues {
  productId: string;
  variantId: string;
  flashPrice: number;
  allocatedQuantity: number;
}

interface FlashSaleItemManagerProps {
  flashSaleId: string;
  items: FlashSaleItemDto[];
}

export default function FlashSaleItemManager({ flashSaleId, items }: FlashSaleItemManagerProps) {
  const [form] = Form.useForm<AddItemFormValues>();
  const addItemMutation = useAddFlashSaleItem();
  const selectedProductId = Form.useWatch("productId", form);

  const [productLabels, setProductLabels] = useState<Record<string, string>>({});
  const [productKeyword, setProductKeyword] = useState("");
  const [productSearchOptions, setProductSearchOptions] = useState<{ value: string; label: string }[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [variantOptions, setVariantOptions] = useState<{ value: string; label: string }[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  useEffect(() => {
    const idsToLoad = items.map((i) => i.productId).filter((id) => !productLabels[id]);
    if (idsToLoad.length === 0) return;
    Promise.all(idsToLoad.map((id) => productsService.adminGetById(id)))
      .then((products) => {
        setProductLabels((prev) => {
          const next = { ...prev };
          products.forEach((p) => {
            next[p.id] = productLabel(p);
          });
          return next;
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const keyword = productKeyword.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!keyword) return;
    debounceRef.current = setTimeout(() => {
      setProductSearchLoading(true);
      productsService
        .adminList({ keyword, pageSize: 20 })
        .then((result) => {
          const options = result.items.map((p) => ({ value: p.id, label: productLabel(p) }));
          setProductSearchOptions(options);
          setProductLabels((prev) => {
            const next = { ...prev };
            options.forEach((o) => {
              next[o.value] = o.label;
            });
            return next;
          });
        })
        .catch(() => setProductSearchOptions([]))
        .finally(() => setProductSearchLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [productKeyword]);

  const [prevProductId, setPrevProductId] = useState(selectedProductId);
  if (prevProductId !== selectedProductId) {
    setPrevProductId(selectedProductId);
    if (!selectedProductId) setVariantOptions([]);
  }

  useEffect(() => {
    if (!selectedProductId) return;
    const timer = setTimeout(() => {
      setVariantsLoading(true);
      productsService
        .adminGetById(selectedProductId)
        .then((product) => {
          const activeVariants = product.variants.filter((v) => v.isActive);
          const options = activeVariants.map((v) => ({ value: v.id, label: variantLabel(v) }));
          setVariantOptions(options);
          if (options.length === 1) {
            form.setFieldValue("variantId", options[0].value);
          } else {
            form.setFieldValue("variantId", undefined);
          }
        })
        .catch(() => setVariantOptions([]))
        .finally(() => setVariantsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedProductId, form]);

  function applyFieldErrors(err: ApiError): boolean {
    if (!err.errors || err.errors.length === 0) return false;
    const fields = err.errors
      .map((e) => {
        const rawField = (e.field ?? "").toLowerCase();
        if (rawField === "productid") return { name: "productId" as const, errors: [e.message] };
        if (rawField === "variantid") return { name: "variantId" as const, errors: [e.message] };
        if (rawField === "flashprice") return { name: "flashPrice" as const, errors: [e.message] };
        if (rawField === "allocatedquantity") return { name: "allocatedQuantity" as const, errors: [e.message] };
        toast.error(e.message);
        return null;
      })
      .filter((f): f is { name: keyof AddItemFormValues; errors: string[] } => f !== null);
    if (fields.length === 0) return false;
    form.setFields(fields);
    return true;
  }

  const handleSubmit = async (values: AddItemFormValues) => {
    const body: AddFlashSaleItemRequest = {
      variantId: values.variantId,
      flashPrice: values.flashPrice,
      allocatedQuantity: values.allocatedQuantity,
    };
    try {
      await addItemMutation.mutateAsync({ flashSaleId, body });
      toast.success("Đã thêm sản phẩm vào flash sale");
      form.resetFields();
      setVariantOptions([]);
    } catch (err) {
      if (err instanceof ApiError && applyFieldErrors(err)) return;
      toast.error(err instanceof ApiError ? err.message : "Thêm sản phẩm thất bại");
    }
  };

  const columns: TableProps<FlashSaleItemDto>["columns"] = [
    { title: "Sản phẩm", key: "product", render: (_, record) => productLabels[record.productId] ?? record.productId },
    { title: "Phân loại", key: "variant", render: (_, record) => record.variantLabel ?? "—" },
    { title: "Giá flash sale", dataIndex: "flashPrice", render: (value: number) => formatVnd(value) },
    { title: "Số lượng", dataIndex: "allocatedQuantity" },
    { title: "Đã bán", dataIndex: "soldQuantity" },
    { title: "Còn lại", dataIndex: "available" },
  ];

  return (
    <div>
      <Form<AddItemFormValues> form={form} layout="inline" onFinish={handleSubmit} style={{ marginBottom: 16, rowGap: 8 }}>
        <Form.Item name="productId" rules={[{ required: true, message: "Chọn sản phẩm" }]}>
          <Select
            showSearch
            filterOption={false}
            options={productSearchOptions}
            onSearch={setProductKeyword}
            loading={productSearchLoading}
            placeholder="Tìm sản phẩm theo tên hoặc SKU"
            notFoundContent={productSearchLoading ? <Spin size="small" /> : null}
            style={{ minWidth: 260 }}
          />
        </Form.Item>
        <Form.Item name="variantId" rules={[{ required: true, message: "Chọn phân loại" }]}>
          <Select
            options={variantOptions}
            loading={variantsLoading}
            disabled={!selectedProductId}
            placeholder="Chọn phân loại"
            notFoundContent={variantsLoading ? <Spin size="small" /> : null}
            style={{ minWidth: 260 }}
          />
        </Form.Item>
        <Form.Item name="flashPrice" rules={[{ required: true, message: "Nhập giá flash sale" }]}>
          <InputNumber<number> min={0} step={1000} placeholder="Giá flash sale" suffix="₫" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="allocatedQuantity" rules={[{ required: true, message: "Nhập số lượng" }]}>
          <InputNumber<number> min={1} placeholder="Số lượng" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={addItemMutation.isPending}>
            Thêm sản phẩm
          </Button>
        </Form.Item>
      </Form>

      <Table<FlashSaleItemDto> rowKey="id" dataSource={items} columns={columns} pagination={false} locale={{ emptyText: "Chưa có sản phẩm nào" }} />
    </div>
  );
}
