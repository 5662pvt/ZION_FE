"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Space, Spin, TreeSelect, type FormProps } from "antd";
import { mapCategoryTree } from "@/components/admin/products/categoryTreeData";
import { useCreatePromotion, useUpdatePromotion } from "@/hooks/useAdminPromotions";
import { useCategoryTree } from "@/hooks/useCategories";
import { productsService } from "@/services/products.service";
import { ApiError } from "@/services/apiClient";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import type { PromotionDto, PromotionScope, PromotionType, PromotionUpsertRequest } from "@/types/promotions";

const { RangePicker } = DatePicker;

interface GiftItemFormValue {
  productId: string;
  variantId: string;
  quantity: number;
}

interface PromotionFormValues {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  maxDiscountAmount?: number;
  minOrderSubtotal: number;
  range: [Dayjs, Dayjs];
  usageLimit?: number;
  perUserLimit?: number;
  scope: PromotionScope;
  targetProductIds: string[];
  targetCategoryIds: string[];
  minQuantity?: number | null;
  giftItems: GiftItemFormValue[];
}

type MappableFieldName = keyof Omit<PromotionFormValues, "range" | "giftItems">;

const FIELD_NAMES: MappableFieldName[] = [
  "name",
  "description",
  "type",
  "value",
  "maxDiscountAmount",
  "minOrderSubtotal",
  "usageLimit",
  "perUserLimit",
  "scope",
  "targetProductIds",
  "targetCategoryIds",
  "minQuantity",
];

function productLabel(product: { name: string; sku: string }): string {
  return `${product.name} (${product.sku})`;
}

function variantLabel(variant: { label: string; sku: string; price: number }): string {
  return `${variant.label} — ${variant.sku} — ${formatVnd(variant.price)}`;
}

interface PromotionFormProps {
  mode: "create" | "edit";
  promotion?: PromotionDto;
}

export default function PromotionForm({ mode, promotion }: PromotionFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<PromotionFormValues>();
  const type = Form.useWatch("type", form);
  const scope = Form.useWatch("scope", form);
  const targetProductIdsWatch = Form.useWatch("targetProductIds", form);
  const giftItemsWatch = Form.useWatch("giftItems", form);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  const { data: categoryTree, isLoading: categoryTreeLoading } = useCategoryTree();
  const categoryTreeData = useMemo(() => mapCategoryTree(categoryTree ?? []), [categoryTree]);

  const [productLabels, setProductLabels] = useState<Record<string, string>>({});
  const [productKeyword, setProductKeyword] = useState("");
  const [productSearchOptions, setProductSearchOptions] = useState<{ value: string; label: string }[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [variantOptionsByProduct, setVariantOptionsByProduct] = useState<Record<string, { value: string; label: string }[]>>({});
  const [variantsLoadingByProduct, setVariantsLoadingByProduct] = useState<Record<string, boolean>>({});

  function loadVariantsForProduct(productId: string): Promise<{ value: string; label: string }[]> {
    const cached = variantOptionsByProduct[productId];
    if (cached) return Promise.resolve(cached);
    setVariantsLoadingByProduct((prev) => ({ ...prev, [productId]: true }));
    return productsService
      .adminGetById(productId)
      .then((product) => {
        const options = product.variants.filter((v) => v.isActive).map((v) => ({ value: v.id, label: variantLabel(v) }));
        setVariantOptionsByProduct((prev) => ({ ...prev, [productId]: options }));
        return options;
      })
      .catch(() => [] as { value: string; label: string }[])
      .finally(() => setVariantsLoadingByProduct((prev) => ({ ...prev, [productId]: false })));
  }

  function handleGiftProductChange(name: number, productId: string) {
    form.setFieldValue(["giftItems", name, "variantId"], undefined);
    if (!productId) return;
    loadVariantsForProduct(productId).then((options) => {
      if (options.length === 1) {
        form.setFieldValue(["giftItems", name, "variantId"], options[0].value);
      }
    });
  }

  useEffect(() => {
    if (mode === "edit" && promotion) {
      form.setFieldsValue({
        name: promotion.name,
        description: promotion.description ?? undefined,
        type: promotion.type,
        value: promotion.value,
        maxDiscountAmount: promotion.maxDiscountAmount ?? undefined,
        minOrderSubtotal: promotion.minOrderSubtotal,
        range: [dayjs(promotion.startsAt), dayjs(promotion.endsAt)],
        usageLimit: promotion.usageLimit ?? undefined,
        perUserLimit: promotion.perUserLimit ?? undefined,
        scope: promotion.scope,
        targetProductIds: promotion.targetProductIds,
        targetCategoryIds: promotion.targetCategoryIds,
        minQuantity: promotion.minQuantity ?? undefined,
        giftItems: promotion.giftItems,
      });

      const idsToLoad = new Set<string>();
      if (promotion.scope === "Products") promotion.targetProductIds.forEach((id) => idsToLoad.add(id));
      promotion.giftItems.forEach((g) => idsToLoad.add(g.productId));

      if (idsToLoad.size > 0) {
        Promise.all(Array.from(idsToLoad).map((id) => productsService.adminGetById(id)))
          .then((products) => {
            setProductLabels((prev) => {
              const next = { ...prev };
              products.forEach((p) => {
                next[p.id] = productLabel(p);
              });
              return next;
            });
            setVariantOptionsByProduct((prev) => {
              const next = { ...prev };
              products.forEach((p) => {
                next[p.id] = p.variants.filter((v) => v.isActive).map((v) => ({ value: v.id, label: variantLabel(v) }));
              });
              return next;
            });
          })
          .catch(() => {});
      }
    }
  }, [mode, promotion, form]);

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

  const productOptions = useMemo(() => {
    const targetProductIds = targetProductIdsWatch ?? [];
    const giftProductIds = (giftItemsWatch ?? [])
      .map((g) => g?.productId)
      .filter((id): id is string => !!id);
    const searchIds = productKeyword.trim() ? productSearchOptions.map((o) => o.value) : [];
    const ids = new Set<string>([...targetProductIds, ...giftProductIds, ...searchIds]);
    return Array.from(ids).map((id) => ({ value: id, label: productLabels[id] ?? id }));
  }, [targetProductIdsWatch, giftItemsWatch, productSearchOptions, productLabels, productKeyword]);

  function applyFieldErrors(err: ApiError): boolean {
    if (!err.errors || err.errors.length === 0) return false;
    const fields = err.errors
      .map((e) => {
        const rawField = e.field ?? "";
        if (rawField.toLowerCase() === "startsat" || rawField.toLowerCase() === "endsat") {
          return { name: "range" as const, errors: [e.message] };
        }
        const match = FIELD_NAMES.find((f) => f.toLowerCase() === rawField.toLowerCase());
        if (!match) {
          toast.error(e.message);
          return null;
        }
        return { name: match, errors: [e.message] };
      })
      .filter((f): f is { name: MappableFieldName | "range"; errors: string[] } => f !== null);
    if (fields.length === 0) return false;
    form.setFields(fields);
    return true;
  }

  const handleSubmit: FormProps<PromotionFormValues>["onFinish"] = async (values) => {
    const isFreeShipping = values.type === "FreeShipping";
    const isGift = values.type === "Gift";
    const body: PromotionUpsertRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      type: values.type,
      value: isFreeShipping || isGift ? 0 : values.value,
      maxDiscountAmount: values.type === "PercentageOff" ? values.maxDiscountAmount ?? null : null,
      minOrderSubtotal: values.minOrderSubtotal,
      startsAt: values.range[0].toISOString(),
      endsAt: values.range[1].toISOString(),
      usageLimit: values.usageLimit ?? null,
      perUserLimit: values.perUserLimit ?? null,
      scope: values.scope,
      targetProductIds: values.scope === "Products" ? values.targetProductIds ?? [] : [],
      targetCategoryIds: values.scope === "Categories" ? values.targetCategoryIds ?? [] : [],
      minQuantity: isGift && values.scope !== "Order" ? values.minQuantity ?? null : null,
      giftItems: isGift
        ? (values.giftItems ?? []).map((g) => ({ productId: g.productId, variantId: g.variantId, quantity: g.quantity }))
        : [],
    };

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(body);
        toast.success("Đã tạo khuyến mãi");
        router.push(`/admin/promotions/${created.id}`);
      } else if (promotion) {
        await updateMutation.mutateAsync({ id: promotion.id, body });
        toast.success("Đã lưu thay đổi");
      }
    } catch (err) {
      if (err instanceof ApiError && applyFieldErrors(err)) return;
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Form<PromotionFormValues>
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: "PercentageOff",
        minOrderSubtotal: 0,
        scope: "Order",
        targetProductIds: [],
        targetCategoryIds: [],
        giftItems: [],
      }}
    >
      <Form.Item
        label="Tên khuyến mãi"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên khuyến mãi" }, { max: 200, message: "Tối đa 200 ký tự" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item label="Loại khuyến mãi" name="type" rules={[{ required: true }]}>
        <Radio.Group
          options={[
            { value: "PercentageOff", label: "Giảm theo %" },
            { value: "FixedAmountOff", label: "Giảm số tiền cố định" },
            { value: "FreeShipping", label: "Miễn phí vận chuyển" },
            { value: "Gift", label: "Quà tặng" },
          ]}
        />
      </Form.Item>

      {type !== "FreeShipping" && type !== "Gift" && (
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            label="Giá trị"
            name="value"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: "Vui lòng nhập giá trị" },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null) return Promise.resolve();
                  if (type === "PercentageOff" && (value < 1 || value > 100)) {
                    return Promise.reject(new Error("Giá trị % phải từ 1 đến 100"));
                  }
                  if (type === "FixedAmountOff" && value <= 0) {
                    return Promise.reject(new Error("Giá trị phải lớn hơn 0"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber<number> min={1} style={{ width: "100%" }} suffix={type === "PercentageOff" ? "%" : "₫"} />
          </Form.Item>

          {type === "PercentageOff" && (
            <Form.Item
              label="Trần giảm tối đa"
              name="maxDiscountAmount"
              style={{ flex: 1 }}
              rules={[{ type: "number", min: 0.01, message: "Phải lớn hơn 0" }]}
            >
              <InputNumber<number> min={0} step={1000} style={{ width: "100%" }} suffix="₫" placeholder="Không giới hạn" />
            </Form.Item>
          )}
        </div>
      )}

      <Form.Item
        label="Đơn tối thiểu"
        name="minOrderSubtotal"
        rules={[
          { required: true, message: "Vui lòng nhập đơn tối thiểu" },
          {
            validator: (_, value) => {
              if (type === "Gift" && scope === "Order" && !(value > 0)) {
                return Promise.reject(new Error("Đơn tối thiểu phải lớn hơn 0 khi áp dụng toàn đơn"));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <InputNumber<number> min={0} step={1000} style={{ width: "100%" }} suffix="₫" />
      </Form.Item>

      <Form.Item
        label="Thời gian áp dụng"
        name="range"
        rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng" }]}
      >
        <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Phạm vi áp dụng" name="scope" rules={[{ required: true }]}>
        <Radio.Group
          options={[
            { value: "Order", label: "Toàn đơn" },
            { value: "Products", label: "Sản phẩm" },
            { value: "Categories", label: "Danh mục" },
          ]}
          onChange={() => form.setFieldsValue({ targetProductIds: [], targetCategoryIds: [], minQuantity: null })}
        />
      </Form.Item>

      {type === "Gift" && scope !== "Order" && (
        <Form.Item
          label="Số lượng mua tối thiểu"
          name="minQuantity"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng mua tối thiểu" },
            { type: "number", min: 1, message: "Tối thiểu 1" },
          ]}
        >
          <InputNumber<number> min={1} style={{ width: "100%" }} />
        </Form.Item>
      )}

      {scope === "Products" && (
        <Form.Item
          label="Sản phẩm áp dụng"
          name="targetProductIds"
          rules={[{ required: true, type: "array", message: "Chọn ít nhất 1 sản phẩm" }]}
        >
          <Select
            mode="multiple"
            filterOption={false}
            options={productOptions}
            onSearch={setProductKeyword}
            loading={productSearchLoading}
            placeholder="Tìm sản phẩm theo tên hoặc SKU"
            notFoundContent={productSearchLoading ? <Spin size="small" /> : null}
          />
        </Form.Item>
      )}

      {scope === "Categories" && (
        <Form.Item
          label="Danh mục áp dụng"
          name="targetCategoryIds"
          rules={[{ required: true, type: "array", message: "Chọn ít nhất 1 danh mục" }]}
        >
          {categoryTreeLoading ? (
            <Select mode="multiple" disabled loading placeholder="Đang tải danh mục…" />
          ) : (
            <TreeSelect treeCheckable treeData={categoryTreeData} placeholder="Chọn danh mục" />
          )}
        </Form.Item>
      )}

      {type === "Gift" && (
        <Form.List
          name="giftItems"
          rules={[
            {
              validator: async (_, items: GiftItemFormValue[] = []) => {
                if (items.length === 0) return Promise.reject(new Error("Thêm ít nhất 1 sản phẩm tặng"));
                if (items.length > 5) return Promise.reject(new Error("Tối đa 5 sản phẩm tặng"));
                const ids = items.map((i) => i?.productId).filter(Boolean);
                if (new Set(ids).size !== ids.length) {
                  return Promise.reject(new Error("Sản phẩm tặng không được trùng"));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <Form.Item label="Sản phẩm tặng" required>
              <Space direction="vertical" style={{ width: "100%" }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ width: "100%" }}>
                    <Form.Item
                      {...restField}
                      name={[name, "productId"]}
                      rules={[{ required: true, message: "Chọn sản phẩm" }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Select
                        showSearch
                        filterOption={false}
                        options={productOptions}
                        onSearch={setProductKeyword}
                        loading={productSearchLoading}
                        placeholder="Tìm sản phẩm theo tên hoặc SKU"
                        notFoundContent={productSearchLoading ? <Spin size="small" /> : null}
                        style={{ minWidth: 280 }}
                        onChange={(value) => handleGiftProductChange(name, value)}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "variantId"]}
                      rules={[{ required: true, message: "Chọn phân loại" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        options={variantOptionsByProduct[giftItemsWatch?.[name]?.productId ?? ""] ?? []}
                        loading={!!variantsLoadingByProduct[giftItemsWatch?.[name]?.productId ?? ""]}
                        disabled={!giftItemsWatch?.[name]?.productId}
                        placeholder="Chọn phân loại"
                        style={{ minWidth: 220 }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Nhập số lượng" }]}
                      initialValue={1}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber<number> min={1} max={10} placeholder="SL" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      Xoá
                    </Button>
                  </Space>
                ))}
                {fields.length < 5 && (
                  <Button type="dashed" onClick={() => add({ quantity: 1 })} block>
                    + Thêm sản phẩm tặng
                  </Button>
                )}
                <Form.ErrorList errors={errors} />
              </Space>
            </Form.Item>
          )}
        </Form.List>
      )}

      <div style={{ display: "flex", gap: 16 }}>
        <Form.Item label="Giới hạn lượt dùng" name="usageLimit" style={{ flex: 1 }} rules={[{ type: "number", min: 1, message: "Tối thiểu 1" }]}>
          <InputNumber<number> min={1} style={{ width: "100%" }} placeholder="Không giới hạn" />
        </Form.Item>
        <Form.Item label="Giới hạn mỗi người" name="perUserLimit" style={{ flex: 1 }} rules={[{ type: "number", min: 1, message: "Tối thiểu 1" }]}>
          <InputNumber<number> min={1} style={{ width: "100%" }} placeholder="Không giới hạn" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
          {mode === "create" ? "Tạo khuyến mãi" : "Lưu thay đổi"}
        </Button>
      </Form.Item>
    </Form>
  );
}
