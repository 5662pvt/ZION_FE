"use client";

import { Button, InputNumber, Space } from "antd";
import { FiMinus, FiPlus } from "react-icons/fi";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function QuantityStepper({ value, min = 1, max, onChange, disabled = false }: QuantityStepperProps) {
  function clamp(next: number): number {
    const lowered = Math.max(next, min);
    return max !== undefined ? Math.min(lowered, max) : lowered;
  }

  return (
    <Space.Compact>
      <Button
        aria-label="Giảm số lượng"
        icon={<FiMinus />}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        style={{ width: 44, height: 44 }}
      />
      <InputNumber
        aria-label="Số lượng"
        min={min}
        max={max}
        value={value}
        controls={false}
        disabled={disabled}
        onChange={(next) => onChange(clamp(next ?? min))}
        style={{ width: 56, height: 44, textAlign: "center" }}
      />
      <Button
        aria-label="Tăng số lượng"
        icon={<FiPlus />}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(clamp(value + 1))}
        style={{ width: 44, height: 44 }}
      />
    </Space.Compact>
  );
}
