"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Flex, Form, Input } from "antd";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/apiClient";

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: ForgotPasswordFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const email = values.email.trim();
      await authService.forgotPassword({ email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        const match = err.errors.find((e) => e.field && e.field.toLowerCase() === "email");
        if (match) {
          form.setFields([{ name: "email", errors: [match.message] }]);
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof ApiError ? err.message : "Gửi yêu cầu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Quên mật khẩu</h1>
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
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Gửi mã đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
      <Flex justify="center" style={{ fontSize: 13 }}>
        <Link href="/login">Quay lại đăng nhập</Link>
      </Flex>
    </>
  );
}
