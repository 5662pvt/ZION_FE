"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Flex, Form, Input } from "antd";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface RegisterFormValues {
  email: string;
  displayName?: string;
  password: string;
  confirmPassword: string;
}

const VALID_FIELDS: Array<keyof RegisterFormValues> = ["email", "password", "displayName"];

export default function RegisterForm() {
  const router = useRouter();
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await authService.register({
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName?.trim() || null,
      });
      if (result.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
      } else {
        toast.success("Đăng ký thành công");
        router.push("/login");
      }
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
        setError(err instanceof ApiError ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Đăng ký</h1>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} disabled={submitting}>
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
        <Form.Item name="displayName" label="Tên hiển thị" rules={[{ max: 128, message: "Tối đa 128 ký tự" }]}>
          <Input autoComplete="name" placeholder="Tên hiển thị (không bắt buộc)" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
            { pattern: /[A-Z]/, message: "Mật khẩu phải có chữ hoa" },
            { pattern: /[a-z]/, message: "Mật khẩu phải có chữ thường" },
            { pattern: /[0-9]/, message: "Mật khẩu phải có số" },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="Mật khẩu" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="Nhập lại mật khẩu" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <Flex justify="center" style={{ fontSize: 13 }}>
        <Link href="/login">Đã có tài khoản? Đăng nhập</Link>
      </Flex>
    </>
  );
}
