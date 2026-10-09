"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Flex, Form, Input, Spin } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";

interface LoginFormValues {
  email: string;
  password: string;
}

function resolveReturnUrl(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = resolveReturnUrl(searchParams.get("returnUrl"));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isLoading, isAuthenticated, router, returnUrl]);

  if (isLoading || isAuthenticated) {
    return (
      <Flex justify="center" style={{ padding: 32 }}>
        <Spin />
      </Flex>
    );
  }

  const handleFinish = async (values: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      router.replace(returnUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Đăng nhập</h1>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={submitting}
        initialValues={{ email: searchParams.get("email") ?? undefined }}
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
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
          <Input.Password autoComplete="current-password" placeholder="Mật khẩu" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      <Flex justify="space-between" style={{ fontSize: 13 }}>
        <Link href="/forgot-password">Quên mật khẩu?</Link>
        <Link href="/register">Đăng ký</Link>
      </Flex>
    </>
  );
}
