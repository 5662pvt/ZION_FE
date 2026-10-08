import { Suspense } from "react";
import { Flex, Spin } from "antd";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" style={{ padding: 32 }}>
          <Spin />
        </Flex>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
