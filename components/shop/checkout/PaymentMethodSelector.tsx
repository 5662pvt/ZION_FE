"use client";

import { Alert, Radio, Space, Typography } from "antd";
import type { PaymentChannel } from "@/types/payments";

const { Text } = Typography;

export type CheckoutPaymentOption = "COD" | PaymentChannel;

const OPTIONS: Array<{ value: CheckoutPaymentOption; label: string }> = [
  { value: "COD", label: "Thanh toán khi nhận hàng" },
  { value: "Card", label: "Thẻ (Visa/Master/JCB)" },
  { value: "EWallet", label: "Ví điện tử (Momo, ZaloPay, ShopeePay)" },
  { value: "BankTransfer", label: "Chuyển khoản ngân hàng" },
];

export function paymentOptionLabel(option: CheckoutPaymentOption): string {
  return OPTIONS.find((o) => o.value === option)?.label ?? option;
}

interface PaymentMethodSelectorProps {
  value: CheckoutPaymentOption;
  onChange: (value: CheckoutPaymentOption) => void;
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value as CheckoutPaymentOption)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value}>
              <Text>{option.label}</Text>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
      {value !== "COD" && (
        <Alert type="info" showIcon message="Thanh toán giả lập, không nhập thông tin thẻ thật" />
      )}
    </Space>
  );
}
