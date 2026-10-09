import { Suspense } from "react";
import { Flex, Spin } from "antd";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" style={{ padding: 32 }}>
          <Spin />
        </Flex>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
