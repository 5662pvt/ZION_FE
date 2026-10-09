"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface ResetPasswordFormValues {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const VALID_FIELDS: Array<keyof ResetPasswordFormValues> = ["email", "code", "newPassword"];

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: ResetPasswordFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const email = values.email.trim();
      await authService.resetPassword({ email, code: values.code.trim(), newPassword: values.newPassword });
      toast.success("Đặt lại mật khẩu thành công, vui lòng đăng nhập");
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        let handled = false;
        err.errors.forEach((e) => {
          const match = VALID_FIELDS.find((n) => e.field && n.toLowerCase() === e.field!.toLowerCase());
          if (match) {
            form.setFields([{ name: match, errors: [e.message] }]);
            handled = true;
          }
        });
        if (!handled) setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Đặt lại mật khẩu</h1>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={submitting}
        initialValues={{ email: searchParams.get("email") ?? "" }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input autoComplete="email" placeholder="email@vidu.com" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã xác minh"
          rules={[
            { required: true, message: "Vui lòng nhập mã" },
            { pattern: /^[0-9]{6}$/, message: "Mã gồm 6 số" },
          ]}
        >
          <Input autoComplete="one-time-code" placeholder="Nhập mã 6 số" maxLength={6} />
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
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
