"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Modal, Radio, Typography } from "antd";
import { useAdjustStock } from "@/hooks/useAdminInventory";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { InventoryItemDto } from "@/types/inventory";

const { Text } = Typography;

type AdjustDirection = "increase" | "decrease";

interface AdjustStockFormValues {
  direction: AdjustDirection;
  quantity: number;
  reason: string;
}

interface AdjustStockModalProps {
  open: boolean;
  item: InventoryItemDto | null;
  onClose: () => void;
}

export default function AdjustStockModal({ open, item, onClose }: AdjustStockModalProps) {
  const [form] = Form.useForm<AdjustStockFormValues>();
  const direction: AdjustDirection = Form.useWatch("direction", form) ?? "increase";
  const quantity: number | undefined = Form.useWatch("quantity", form);
  const queryClient = useQueryClient();
  const adjustMutation = useAdjustStock();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ direction: "increase" });
    }
  }, [open, form]);

  if (!item) return null;

  const delta = direction === "decrease" ? -(quantity ?? 0) : quantity ?? 0;
  const previewOnHand = item.onHand + delta;

  const handleSubmit = async (values: AdjustStockFormValues) => {
    const appliedDelta = values.direction === "decrease" ? -values.quantity : values.quantity;
    try {
      await adjustMutation.mutateAsync({
        productId: item.productId,
        body: { delta: appliedDelta, reason: values.reason.trim() },
      });
      toast.success("Đã điều chỉnh tồn kho");
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("Dữ liệu đã thay đổi, vui lòng thử lại");
        queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      } else {
        toast.error(err instanceof ApiError ? err.message : "Điều chỉnh thất bại");
      }
    }
  };

  return (
    <Modal
      open={open}
      title={`Điều chỉnh tồn kho — ${item.productName}`}
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
        initialValues={{ direction: "increase" }}
        requiredMark={false}
      >
        <Form.Item name="direction" label="Loại điều chỉnh" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="increase">Nhập thêm</Radio>
            <Radio value="decrease">Xuất bớt</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng" },
            { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[
            { required: true, message: "Vui lòng nhập lý do" },
            { max: 200, message: "Tối đa 200 ký tự" },
          ]}
        >
          <Input.TextArea rows={3} maxLength={200} showCount placeholder="Lý do điều chỉnh tồn kho" />
        </Form.Item>
        <Text type="secondary">
          Tồn hiện tại: {item.onHand} — Tồn sau điều chỉnh: {previewOnHand}
        </Text>
      </Form>
    </Modal>
  );
}
