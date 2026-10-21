"use client";

import { Radio, Space, Typography } from "antd";
import type { ProductOptionDto, ProductVariantDto } from "@/types/products";
import type { AvailabilityDto } from "@/types/inventory";

const { Text } = Typography;

interface VariantSelectorProps {
  options: ProductOptionDto[];
  variants: ProductVariantDto[];
  availability?: Record<string, AvailabilityDto>;
  selected: (string | null)[];
  onChange: (optionIndex: number, value: string) => void;
}

function variantOptionValue(variant: ProductVariantDto, optionIndex: number): string | null {
  return optionIndex === 0 ? variant.option1Value : variant.option2Value;
}

export default function VariantSelector({ options, variants, availability, selected, onChange }: VariantSelectorProps) {
  function isValueDisabled(optionIndex: number, value: string): boolean {
    const otherIndex = optionIndex === 0 ? 1 : 0;
    const otherValue = options.length > 1 ? selected[otherIndex] : null;

    const candidates = variants.filter((variant) => {
      if (!variant.isActive) return false;
      if (variantOptionValue(variant, optionIndex) !== value) return false;
      if (otherValue && variantOptionValue(variant, otherIndex) !== otherValue) return false;
      return true;
    });

    if (candidates.length === 0) return true;
    if (!availability) return false;
    return candidates.every((variant) => (availability[variant.id]?.available ?? 0) <= 0);
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {options.map((option, optionIndex) => (
        <div key={option.name}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {option.name}
          </Text>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={selected[optionIndex] ?? undefined}
            onChange={(e) => onChange(optionIndex, e.target.value)}
          >
            <Space wrap size={8}>
              {option.values.map((value) => (
                <Radio.Button key={value} value={value} disabled={isValueDisabled(optionIndex, value)}>
                  {value}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </div>
      ))}
    </Space>
  );
}
