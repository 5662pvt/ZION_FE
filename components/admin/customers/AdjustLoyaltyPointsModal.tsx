"use client";

import { useEffect } from "react";
import { Form, Input, InputNumber, Modal } from "antd";
import { useAdjustLoyaltyPoints } from "@/hooks/useAdminLoyalty";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface AdjustLoyaltyPointsFormValues {
  delta: number;
  reason: string;
}

interface AdjustLoyaltyPointsModalProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function AdjustLoyaltyPointsModal({ open, userId, onClose }: AdjustLoyaltyPointsModalProps) {
  const [form] = Form.useForm<AdjustLoyaltyPointsFormValues>();
  const adjustMutation = useAdjustLoyaltyPoints();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  if (!userId) return null;

  const handleSubmit = async (values: AdjustLoyaltyPointsFormValues) => {
    try {
      await adjustMutation.mutateAsync({ userId, body: { delta: values.delta, reason: values.reason.trim() } });
      toast.success("Đã điều chỉnh số Xu");
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors?.[0]?.code === "Loyalty.InsufficientPoints") {
        toast.error("Khách không đủ Xu để trừ");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Điều chỉnh thất bại");
      }
    }
  };

  return (
    <Modal
      open={open}
      title="Điều chỉnh Xu"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={adjustMutation.isPending}
      destroyOnHidden
      okText="Điều chỉnh"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={adjustMutation.isPending}
        requiredMark={false}
      >
        <Form.Item
          name="delta"
          label="Số Xu điều chỉnh (âm để trừ)"
          rules={[
            { required: true, message: "Vui lòng nhập số Xu" },
            { type: "number", min: -1_000_000, max: 1_000_000, message: "Số Xu phải trong khoảng ±1.000.000" },
            {
              validator: (_, value: number | undefined) =>
                value === 0 ? Promise.reject(new Error("Số Xu điều chỉnh phải khác 0")) : Promise.resolve(),
            },
          ]}
        >
          <InputNumber<number>
            min={-1_000_000}
            max={1_000_000}
            style={{ width: "100%" }}
            placeholder="Vd: 100 hoặc -100"
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[
            { required: true, message: "Vui lòng nhập lý do" },
            { max: 500, message: "Tối đa 500 ký tự" },
          ]}
        >
          <Input.TextArea rows={3} maxLength={500} showCount placeholder="Lý do điều chỉnh Xu" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
