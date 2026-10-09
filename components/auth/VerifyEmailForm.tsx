"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface VerifyEmailFormValues {
  email: string;
  code: string;
}

const VALID_FIELDS: Array<keyof VerifyEmailFormValues> = ["email", "code"];
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<VerifyEmailFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const applyErrors = (err: ApiError) => {
    let handled = false;
    err.errors.forEach((e) => {
      const match = VALID_FIELDS.find((n) => e.field && n.toLowerCase() === e.field!.toLowerCase());
      if (match) {
        form.setFields([{ name: match, errors: [e.message] }]);
        handled = true;
      }
    });
    if (!handled) setError(err.message);
  };

  const handleFinish = async (values: VerifyEmailFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const email = values.email.trim();
      await authService.verifyEmail({ email, code: values.code.trim() });
      toast.success("Xác minh email thành công, vui lòng đăng nhập");
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError) applyErrors(err);
      else setError("Xác minh thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const email = form.getFieldValue("email");
    if (!email) {
      form.setFields([{ name: "email", errors: ["Vui lòng nhập email"] }]);
      return;
    }
    setError(null);
    setResending(true);
    try {
      await authService.resendVerification({ email: String(email).trim() });
      toast.success("Đã gửi lại mã xác minh");
      startCooldown();
    } catch (err) {
      if (err instanceof ApiError) applyErrors(err);
      else setError("Gửi lại mã thất bại. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Xác minh email</h1>
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
            { required: true, message: "Vui lòng nhập mã xác minh" },
            { pattern: /^[0-9]{6}$/, message: "Mã xác minh gồm 6 số" },
          ]}
        >
          <Input autoComplete="one-time-code" placeholder="Nhập mã 6 số" maxLength={6} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Xác minh
          </Button>
        </Form.Item>
      </Form>
      <Button type="link" block disabled={resending || cooldown > 0} loading={resending} onClick={handleResend}>
        {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : "Gửi lại mã"}
      </Button>
    </>
  );
}
