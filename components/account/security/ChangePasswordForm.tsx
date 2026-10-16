"use client";

import { useState } from "react";
import { Alert, Button, Form, Input } from "antd";
import { useChangePassword } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const VALID_FIELDS: Array<keyof ChangePasswordFormValues> = ["currentPassword", "newPassword"];

export default function ChangePasswordForm() {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const changePassword = useChangePassword();
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: ChangePasswordFormValues) => {
    setError(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.resetFields();
      toast.success("Đổi mật khẩu thành công. Các thiết bị khác đã bị đăng xuất.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors.some((e) => e.code === "Auth.InvalidCurrentPassword")) {
          form.setFields([{ name: "currentPassword", errors: [err.message] }]);
          return;
        }
        if (err.errors.some((e) => e.code === "Auth.PasswordUnchanged")) {
          form.setFields([{ name: "newPassword", errors: [err.message] }]);
          return;
        }
        if (err.errors.length > 0) {
          let handled = false;
          err.errors.forEach((e) => {
            const match = VALID_FIELDS.find((n) => e.field && n.toLowerCase() === e.field!.toLowerCase());
            if (match) {
              form.setFields([{ name: match, errors: [e.message] }]);
              handled = true;
            }
          });
          if (!handled) setError(err.message);
          return;
        }
        setError(err.message);
      } else {
        setError("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Bảo mật</h2>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} style={{ maxWidth: 480 }}>
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
        >
          <Input.Password autoComplete="current-password" placeholder="Mật khẩu hiện tại" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
            { pattern: /[A-Z]/, message: "Mật khẩu phải có chữ hoa" },
            { pattern: /[a-z]/, message: "Mật khẩu phải có chữ thường" },
            { pattern: /[0-9]/, message: "Mật khẩu phải có số" },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="Mật khẩu mới" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
