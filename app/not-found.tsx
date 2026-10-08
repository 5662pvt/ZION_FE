"use client";

import Link from "next/link";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Không tìm thấy trang bạn yêu cầu."
      extra={
        <Link href="/">
          <Button type="primary">Về trang chủ</Button>
        </Link>
      }
    />
  );
}
