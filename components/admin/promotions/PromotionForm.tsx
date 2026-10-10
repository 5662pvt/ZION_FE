"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { Button, DatePicker, Form, Input, InputNumber, Radio, type FormProps } from "antd";
import { useCreatePromotion, useUpdatePromotion } from "@/hooks/useAdminPromotions";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { PromotionDto, PromotionType, PromotionUpsertRequest } from "@/types/promotions";

const { RangePicker } = DatePicker;

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
}

type MappableFieldName = keyof Omit<PromotionFormValues, "range">;

const FIELD_NAMES: MappableFieldName[] = [
  "name",
  "description",
  "type",
  "value",
  "maxDiscountAmount",
  "minOrderSubtotal",
  "usageLimit",
  "perUserLimit",
];

interface PromotionFormProps {
  mode: "create" | "edit";
  promotion?: PromotionDto;
}

export default function PromotionForm({ mode, promotion }: PromotionFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<PromotionFormValues>();
  const type = Form.useWatch("type", form);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

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
      });
    }
  }, [mode, promotion, form]);

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
    const body: PromotionUpsertRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      type: values.type,
      value: values.value,
      maxDiscountAmount: values.type === "PercentageOff" ? values.maxDiscountAmount ?? null : null,
      minOrderSubtotal: values.minOrderSubtotal,
      startsAt: values.range[0].toISOString(),
      endsAt: values.range[1].toISOString(),
      usageLimit: values.usageLimit ?? null,
      perUserLimit: values.perUserLimit ?? null,
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
      initialValues={{ type: "PercentageOff", minOrderSubtotal: 0 }}
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
          ]}
        />
      </Form.Item>

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

      <Form.Item
        label="Đơn tối thiểu"
        name="minOrderSubtotal"
        rules={[{ required: true, message: "Vui lòng nhập đơn tối thiểu" }]}
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
