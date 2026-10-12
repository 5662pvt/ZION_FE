"use client";

import { Rate } from "antd";

interface StarRatingProps {
  value: number;
  allowHalf?: boolean;
  fontSize?: number;
}

export default function StarRating({ value, allowHalf = true, fontSize }: StarRatingProps) {
  return <Rate disabled allowHalf={allowHalf} value={value} style={fontSize ? { fontSize } : undefined} />;
}
