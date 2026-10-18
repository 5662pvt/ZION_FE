"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import { Button, DatePicker, Form, Input, type FormProps } from "antd";
import { useCreateFlashSale, useUpdateFlashSale } from "@/hooks/useAdminFlashSales";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { FlashSaleDto, FlashSaleUpsertRequest } from "@/types/flashSales";

const { RangePicker } = DatePicker;

interface FlashSaleFormValues {
  name: string;
  range: [Dayjs, Dayjs];
}

interface FlashSaleFormProps {
  mode: "create" | "edit";
  flashSale?: FlashSaleDto;
}

export default function FlashSaleForm({ mode, flashSale }: FlashSaleFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<FlashSaleFormValues>();
  const createMutation = useCreateFlashSale();
  const updateMutation = useUpdateFlashSale();

  useEffect(() => {
    if (mode === "edit" && flashSale) {
      form.setFieldsValue({
        name: flashSale.name,
        range: [dayjs(flashSale.startsAt), dayjs(flashSale.endsAt)],
      });
    }
  }, [mode, flashSale, form]);

  const handleSubmit: FormProps<FlashSaleFormValues>["onFinish"] = async (values) => {
    const body: FlashSaleUpsertRequest = {
      name: values.name.trim(),
      startsAt: values.range[0].toISOString(),
      endsAt: values.range[1].toISOString(),
    };

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(body);
        toast.success("Đã tạo flash sale");
        router.push(`/admin/flash-sales/${created.id}`);
      } else if (flashSale) {
        await updateMutation.mutateAsync({ id: flashSale.id, body });
        toast.success("Đã lưu thay đổi");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  };

  return (
    <Form<FlashSaleFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Tên flash sale"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên flash sale" }, { max: 200, message: "Tối đa 200 ký tự" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Thời gian diễn ra"
        name="range"
        rules={[{ required: true, message: "Vui lòng chọn thời gian diễn ra" }]}
      >
        <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
          {mode === "create" ? "Tạo flash sale" : "Lưu thay đổi"}
        </Button>
      </Form.Item>
    </Form>
  );
}
