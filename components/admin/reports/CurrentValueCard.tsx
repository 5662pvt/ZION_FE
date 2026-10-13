"use client";

import Link from "next/link";
import { Card, Statistic } from "antd";

interface CurrentValueCardProps {
  title: string;
  value: number;
  href: string;
}

export default function CurrentValueCard({ title, value, href }: CurrentValueCardProps) {
  return (
    <Link href={href}>
      <Card hoverable>
        <Statistic title={title} value={value} />
      </Card>
    </Link>
  );
}
