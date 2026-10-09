import { Suspense } from "react";
import { Flex, Spin } from "antd";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" style={{ padding: 32 }}>
          <Spin />
        </Flex>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
