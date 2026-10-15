"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, type TableProps } from "antd";
import { useAddCoupon, useDeactivateCoupon, useGenerateCoupons } from "@/hooks/useAdminPromotions";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { CouponStatusBadge } from "@/components/ui/StatusBadge";
import type { CouponDto } from "@/types/promotions";

interface CouponManagerProps {
  promotionId: string;
  coupons: CouponDto[];
}

interface AddCouponFormValues {
  code: string;
}

interface GenerateFormValues {
  prefix: string;
  count: number;
}

export default function CouponManager({ promotionId, coupons }: CouponManagerProps) {
  const [addForm] = Form.useForm<AddCouponFormValues>();
  const [generateForm] = Form.useForm<GenerateFormValues>();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<CouponDto[] | null>(null);

  const addMutation = useAddCoupon();
  const generateMutation = useGenerateCoupons();
  const deactivateMutation = useDeactivateCoupon();

  async function handleAddCoupon(values: AddCouponFormValues) {
    try {
      await addMutation.mutateAsync({ id: promotionId, body: { code: values.code.toUpperCase() } });
      toast.success("Đã thêm mã giảm giá");
      addForm.resetFields();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        addForm.setFields([{ name: "code", errors: [err.message] }]);
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Không thêm được mã");
    }
  }

  async function handleGenerate(values: GenerateFormValues) {
    try {
      const result = await generateMutation.mutateAsync({
        id: promotionId,
        body: { prefix: values.prefix.toUpperCase(), count: values.count },
      });
      setGeneratedCodes(result.codes);
      toast.success(`Đã sinh ${result.codes.length} mã`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không sinh được mã");
    }
  }

  function closeGenerateModal() {
    setGenerateOpen(false);
    setGeneratedCodes(null);
    generateForm.resetFields();
  }

  async function handleCopyAll() {
    if (!generatedCodes || generatedCodes.length === 0) return;
    await navigator.clipboard.writeText(generatedCodes.map((c) => c.code).join("\n"));
    toast.success(`Đã sao chép ${generatedCodes.length} mã`);
  }

  function handleDeactivate(couponId: string) {
    deactivateMutation.mutate(
      { id: promotionId, couponId },
      {
        onSuccess: () => toast.success("Đã vô hiệu mã"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Vô hiệu thất bại"),
      },
    );
  }

  const columns: TableProps<CouponDto>["columns"] = [
    { title: "Mã", dataIndex: "code" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive: boolean) => <CouponStatusBadge isActive={isActive} />,
    },
    { title: "Lượt dùng", dataIndex: "usedCount" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) =>
        record.isActive && (
          <Popconfirm title="Vô hiệu mã này?" onConfirm={() => handleDeactivate(record.id)}>
            <Button size="small" danger>
              Vô hiệu
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap align="start">
        <Form<AddCouponFormValues> form={addForm} layout="inline" onFinish={handleAddCoupon}>
          <Form.Item
            name="code"
            rules={[
              { required: true, message: "Nhập mã" },
              { pattern: /^[A-Za-z0-9-]{3,30}$/, message: "3-30 ký tự, chỉ gồm A-Z 0-9 -" },
            ]}
          >
            <Input placeholder="Mã giảm giá" style={{ width: 200 }} onChange={(e) => addForm.setFieldValue("code", e.target.value.toUpperCase())} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={addMutation.isPending}>
              Thêm mã
            </Button>
          </Form.Item>
        </Form>
        <Button onClick={() => setGenerateOpen(true)}>Sinh hàng loạt</Button>
      </Space>

      <Table<CouponDto>
        rowKey="id"
        dataSource={coupons}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "Chưa có mã giảm giá" }}
      />

      <Modal
        open={generateOpen}
        title="Sinh mã hàng loạt"
        onCancel={closeGenerateModal}
        footer={generatedCodes ? <Button onClick={closeGenerateModal}>Đóng</Button> : null}
        destroyOnHidden
      >
        {!generatedCodes ? (
          <Form<GenerateFormValues> form={generateForm} layout="vertical" onFinish={handleGenerate} initialValues={{ count: 10 }}>
            <Form.Item
              label="Tiền tố"
              name="prefix"
              rules={[
                { required: true, message: "Nhập tiền tố" },
                { max: 10, message: "Tối đa 10 ký tự" },
                { pattern: /^[A-Za-z0-9-]+$/, message: "Chỉ gồm A-Z 0-9 -" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Số lượng" name="count" rules={[{ required: true, message: "Nhập số lượng" }]}>
              <InputNumber<number> min={1} max={500} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={generateMutation.isPending}>
                Sinh mã
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <Typography.Paragraph>Đã sinh {generatedCodes.length} mã:</Typography.Paragraph>
            <Input.TextArea
              readOnly
              rows={Math.min(10, generatedCodes.length)}
              value={generatedCodes.map((c) => c.code).join("\n")}
              style={{ fontFamily: "monospace" }}
            />
            <Button style={{ marginTop: 12 }} onClick={handleCopyAll}>
              Sao chép tất cả
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
