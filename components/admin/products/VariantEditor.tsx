"use client";

import { useState } from "react";
import { Button, Card, Input, InputNumber, Modal, Select, Space, Switch, Table, Typography, type TableProps } from "antd";
import { useSetVariants } from "@/hooks/useAdminProducts";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { slugify } from "@/utils/slugify";
import type { ProductDto, SetVariantsRequest } from "@/types/products";

const { Text } = Typography;

interface OptionGroupState {
  name: string;
  values: string[];
}

interface VariantRow {
  key: string;
  id?: string;
  option1Value: string | null;
  option2Value: string | null;
  sku: string;
  price: number;
  currency: string;
  isActive: boolean;
  imageId: string | null;
}

interface VariantEditorProps {
  product: ProductDto;
}

function comboKey(option1Value: string | null, option2Value: string | null): string {
  return `${option1Value ?? ""}__${option2Value ?? ""}`;
}

function suggestSku(baseSku: string, option1Value: string | null, option2Value: string | null): string {
  const parts = [baseSku];
  if (option1Value) parts.push(slugify(option1Value));
  if (option2Value) parts.push(slugify(option2Value));
  return parts.join("-");
}

function activeOptionGroups(groups: OptionGroupState[]): OptionGroupState[] {
  return groups.filter((g) => g.name.trim() && g.values.length > 0);
}

function buildCombos(groups: OptionGroupState[]): Array<{ option1Value: string | null; option2Value: string | null }> {
  const activeGroups = activeOptionGroups(groups);
  const [g1, g2] = activeGroups;
  if (!g1) return [{ option1Value: null, option2Value: null }];
  if (!g2) return g1.values.map((v) => ({ option1Value: v, option2Value: null }));
  const combos: Array<{ option1Value: string; option2Value: string }> = [];
  g1.values.forEach((v1) => {
    g2.values.forEach((v2) => {
      combos.push({ option1Value: v1, option2Value: v2 });
    });
  });
  return combos;
}

function regenerateRows(
  groups: OptionGroupState[],
  prevRows: VariantRow[],
  product: ProductDto,
): VariantRow[] {
  const combos = buildCombos(groups);
  const prevByKey = new Map(prevRows.map((r) => [r.key, r]));
  const originalByKey = new Map(product.variants.map((v) => [comboKey(v.option1Value, v.option2Value), v]));

  return combos.map((combo) => {
    const key = comboKey(combo.option1Value, combo.option2Value);
    const prev = prevByKey.get(key);
    if (prev) return prev;

    const original = originalByKey.get(key);
    if (original) {
      return {
        key,
        id: original.id,
        option1Value: combo.option1Value,
        option2Value: combo.option2Value,
        sku: original.sku,
        price: original.price,
        currency: original.currency,
        isActive: true,
        imageId: original.imageId,
      };
    }

    return {
      key,
      id: undefined,
      option1Value: combo.option1Value,
      option2Value: combo.option2Value,
      sku: suggestSku(product.sku, combo.option1Value, combo.option2Value),
      price: product.price,
      currency: product.currency,
      isActive: true,
      imageId: null,
    };
  });
}

function rowLabel(row: VariantRow): string {
  if (row.option1Value && row.option2Value) return `${row.option1Value} / ${row.option2Value}`;
  if (row.option1Value) return row.option1Value;
  return "Mặc định";
}

function formatPriceInput(value: number | undefined | null): string {
  return value !== undefined && value !== null ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}

function parsePriceInput(value: string | undefined): number {
  return value ? Number(value.replace(/[^\d]/g, "")) : 0;
}

export default function VariantEditor({ product }: VariantEditorProps) {
  const [optionGroups, setOptionGroups] = useState<OptionGroupState[]>(() =>
    product.options.map((o) => ({ name: o.name, values: [...o.values] })),
  );
  const [rows, setRows] = useState<VariantRow[]>(() => regenerateRows(optionGroups, [], product));
  const [prevOptionGroups, setPrevOptionGroups] = useState(optionGroups);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [bulkPrice, setBulkPrice] = useState<number | null>(null);
  const setVariantsMutation = useSetVariants();

  if (prevOptionGroups !== optionGroups) {
    setPrevOptionGroups(optionGroups);
    setRows((prev) => regenerateRows(optionGroups, prev, product));
  }

  function addGroup() {
    if (optionGroups.length >= 2) return;
    setOptionGroups((prev) => [...prev, { name: "", values: [] }]);
  }

  function removeGroup(index: number) {
    setOptionGroups((prev) => prev.filter((_, i) => i !== index));
  }

  function updateGroupName(index: number, name: string) {
    setOptionGroups((prev) => prev.map((g, i) => (i === index ? { ...g, name } : g)));
  }

  function updateGroupValues(index: number, values: string[]) {
    const seen = new Set<string>();
    const deduped: string[] = [];
    values.forEach((raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);
      deduped.push(trimmed);
    });
    setOptionGroups((prev) => prev.map((g, i) => (i === index ? { ...g, values: deduped } : g)));
  }

  function updateRow(key: string, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setRowErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function applyBulkPrice() {
    if (bulkPrice === null) return;
    setRows((prev) => prev.map((r) => ({ ...r, price: bulkPrice })));
    toast.success("Đã áp dụng giá cho tất cả phân loại");
  }

  function applyFieldErrors(err: ApiError, submittedRows: VariantRow[]): boolean {
    if (!err.errors || err.errors.length === 0) return false;
    const nextRowErrors: Record<string, string> = {};
    let handledAny = false;
    err.errors.forEach((e) => {
      const match = /variants\[(\d+)\]\.(\w+)/i.exec(e.field ?? "");
      const row = match ? submittedRows[Number(match[1])] : undefined;
      if (row) {
        nextRowErrors[row.key] = e.message;
        handledAny = true;
      } else {
        toast.error(e.message);
      }
    });
    if (handledAny) setRowErrors((prev) => ({ ...prev, ...nextRowErrors }));
    return handledAny;
  }

  async function submitVariants() {
    const trimmedRows = rows.map((r) => ({ ...r, sku: r.sku.trim() }));

    if (trimmedRows.some((r) => !r.sku)) {
      toast.error("Vui lòng nhập SKU cho tất cả phân loại");
      return;
    }
    const skuSeen = new Set<string>();
    for (const r of trimmedRows) {
      const lower = r.sku.toLowerCase();
      if (skuSeen.has(lower)) {
        toast.error(`SKU "${r.sku}" bị trùng`);
        return;
      }
      skuSeen.add(lower);
    }
    if (trimmedRows.some((r) => r.price === null || r.price === undefined || r.price < 0)) {
      toast.error("Vui lòng nhập giá hợp lệ cho tất cả phân loại");
      return;
    }
    if (optionGroups.some((g) => g.values.length > 0 && !g.name.trim())) {
      toast.error("Vui lòng nhập tên cho nhóm phân loại có giá trị");
      return;
    }

    setRowErrors({});
    setRows(trimmedRows);

    const activeGroups = activeOptionGroups(optionGroups);
    const body: SetVariantsRequest = {
      options: activeGroups.map((g) => ({ name: g.name.trim(), values: g.values })),
      variants: trimmedRows.map((r) => ({
        id: r.id,
        option1Value: r.option1Value ?? undefined,
        option2Value: r.option2Value ?? undefined,
        sku: r.sku,
        price: r.price,
        currency: r.currency,
        isActive: r.isActive,
        imageId: r.imageId ?? undefined,
      })),
    };

    try {
      const updated = await setVariantsMutation.mutateAsync({ id: product.id, body });
      setRows(regenerateRows(optionGroups, [], updated));
      toast.success("Đã lưu phân loại hàng");
    } catch (err) {
      if (err instanceof ApiError && applyFieldErrors(err, trimmedRows)) return;
      toast.error(err instanceof ApiError ? err.message : "Lưu phân loại thất bại");
    }
  }

  function handleSave() {
    const currentIds = new Set(rows.map((r) => r.id).filter((id): id is string => !!id));
    const disappearing = product.variants.filter((v) => v.isActive && !currentIds.has(v.id));

    if (disappearing.length > 0) {
      Modal.confirm({
        title: "Xác nhận lưu phân loại",
        content: `${disappearing.length} phân loại sẽ bị ẩn. Tiếp tục?`,
        okText: "Lưu",
        cancelText: "Hủy",
        onOk: submitVariants,
      });
      return;
    }

    void submitVariants();
  }

  const imageOptions = product.images.map((img, idx) => ({
    value: img.id,
    label: (
      <Space size={6}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt="" width={20} height={20} style={{ objectFit: "cover", borderRadius: 2 }} />
        <span>{img.alt || `Ảnh ${idx + 1}`}</span>
      </Space>
    ),
  }));

  const columns: TableProps<VariantRow>["columns"] = [
    { title: "Phân loại", key: "label", render: (_, row) => rowLabel(row) },
    {
      title: "SKU",
      key: "sku",
      render: (_, row) => (
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Input
            status={rowErrors[row.key] ? "error" : undefined}
            value={row.sku}
            onChange={(e) => updateRow(row.key, { sku: e.target.value })}
            style={{ width: 200 }}
          />
          {rowErrors[row.key] && <Text type="danger" style={{ fontSize: 12 }}>{rowErrors[row.key]}</Text>}
        </Space>
      ),
    },
    {
      title: "Giá",
      key: "price",
      render: (_, row) => (
        <InputNumber<number>
          min={0}
          step={1000}
          value={row.price}
          onChange={(value) => updateRow(row.key, { price: value ?? 0 })}
          formatter={formatPriceInput}
          parser={parsePriceInput}
          style={{ width: 160 }}
        />
      ),
    },
    {
      title: "Ảnh",
      key: "image",
      render: (_, row) => (
        <Select
          allowClear
          placeholder="Ảnh chung"
          value={row.imageId ?? undefined}
          onChange={(value) => updateRow(row.key, { imageId: value ?? null })}
          options={imageOptions}
          style={{ width: 180 }}
        />
      ),
    },
    {
      title: "Hoạt động",
      key: "isActive",
      render: (_, row) => <Switch checked={row.isActive} onChange={(checked) => updateRow(row.key, { isActive: checked })} />,
    },
  ];

  return (
    <div>
      {optionGroups.map((group, index) => (
        <Card key={index} size="small" style={{ marginBottom: 12 }}>
          <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}>
            <Input
              value={group.name}
              placeholder={`Tên nhóm phân loại ${index + 1} (VD: Màu sắc)`}
              style={{ width: 240 }}
              onChange={(e) => updateGroupName(index, e.target.value)}
            />
            <Button danger size="small" onClick={() => removeGroup(index)}>
              Xoá nhóm
            </Button>
          </Space>
          <Select
            mode="tags"
            style={{ width: "100%" }}
            value={group.values}
            placeholder="Nhập giá trị rồi Enter (VD: Đỏ, Xanh)"
            onChange={(values) => updateGroupValues(index, values)}
            tokenSeparators={[","]}
            notFoundContent={null}
          />
        </Card>
      ))}

      {optionGroups.length < 2 && (
        <Button type="dashed" onClick={addGroup} block style={{ marginBottom: 16 }}>
          + Thêm nhóm phân loại
        </Button>
      )}

      <Space style={{ marginBottom: 12 }}>
        <InputNumber<number>
          min={0}
          step={1000}
          placeholder="Giá áp dụng cho tất cả"
          value={bulkPrice ?? undefined}
          onChange={(value) => setBulkPrice(value ?? null)}
          formatter={formatPriceInput}
          parser={parsePriceInput}
          style={{ width: 200 }}
        />
        <Button onClick={applyBulkPrice} disabled={bulkPrice === null}>
          Áp dụng giá cho tất cả
        </Button>
      </Space>

      <Table<VariantRow>
        rowKey="key"
        dataSource={rows}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "Chưa có phân loại" }}
        style={{ marginBottom: 16 }}
      />

      <Button type="primary" loading={setVariantsMutation.isPending} onClick={handleSave}>
        Lưu phân loại
      </Button>
    </div>
  );
}
