"use client";

import { Radio, Space, Typography } from "antd";
import type { PaymentMethod } from "@/types/orders";

const { Text } = Typography;

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Radio.Group value={value} onChange={(e) => onChange(e.target.value as PaymentMethod)} style={{ width: "100%" }}>
      <Space direction="vertical" size={8}>
        <Radio value="COD">
          <Text>Thanh toán khi nhận hàng (COD)</Text>
        </Radio>
        <Radio value="Online">
          <Text>Thanh toán online (cổng thử nghiệm)</Text>
        </Radio>
      </Space>
    </Radio.Group>
  );
}
