"use client";

import { useEffect, useRef } from "react";
import { Radio, Space, Tooltip, Typography } from "antd";
import type { ProductOptionDto, ProductVariantDto } from "@/types/products";
import type { AvailabilityDto } from "@/types/inventory";

const { Text } = Typography;

interface VariantSelectorProps {
  options: ProductOptionDto[];
  variants: ProductVariantDto[];
  availability?: Record<string, AvailabilityDto>;
  selected: (string | null)[];
  onChange: (optionIndex: number, value: string | null) => void;
}

function variantOptionValue(variant: ProductVariantDto, optionIndex: number): string | null {
  return optionIndex === 0 ? variant.option1Value : variant.option2Value;
}

export default function VariantSelector({ options, variants, availability, selected, onChange }: VariantSelectorProps) {
  // Tier 1 is never disabled by the tier-2 choice (that would make the other tier's
  // values unreachable); tier 2 is filtered by the chosen tier 1 value only.
  function isValueDisabled(optionIndex: number, value: string): boolean {
    const tier1Value = optionIndex === 1 ? selected[0] : null;

    const candidates = variants.filter((variant) => {
      if (!variant.isActive) return false;
      if (variantOptionValue(variant, optionIndex) !== value) return false;
      if (tier1Value && variantOptionValue(variant, 0) !== tier1Value) return false;
      return true;
    });

    if (candidates.length === 0) return true;
    if (!availability) return false;
    return candidates.every((variant) => (availability[variant.id]?.available ?? 0) <= 0);
  }

  const activeVariants = variants.filter((v) => v.isActive);

  // A tier1+tier2 combo is usable only if an active variant exists for it and, when
  // availability is known, that variant still has stock.
  function comboInStock(tier1Value: string, tier2Value: string): boolean {
    const variant = variants.find(
      (v) => v.isActive && v.option1Value === tier1Value && v.option2Value === tier2Value,
    );
    if (!variant) return false;
    if (!availability) return true;
    return (availability[variant.id]?.available ?? 0) > 0;
  }

  // Auto-select an option that only has one value, and auto-select the sole active variant.
  useEffect(() => {
    options.forEach((option, index) => {
      if (option.values.length === 1 && !selected[index]) {
        onChange(index, option.values[0]);
      }
    });
    if (activeVariants.length === 1) {
      const only = activeVariants[0];
      if (options[0] && selected[0] !== only.option1Value) onChange(0, only.option1Value);
      if (options[1] && selected[1] !== only.option2Value) onChange(1, only.option2Value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, variants]);

  // Clear the invalid side when the current tier1+tier2 combo is out of stock. Tracks the
  // previous selection to tell which side just changed: if tier 2 changed alone, tier 1 is the
  // stale side to clear; otherwise (tier 1 changed, availability/variants changed, or initial
  // mount) tier 2 is cleared. Never clears both in the same pass.
  const prevSelectedRef = useRef<[string | null, string | null]>([null, null]);
  useEffect(() => {
    if (options.length < 2) return;
    const tier1 = selected[0];
    const tier2 = selected[1];
    const [prevTier1, prevTier2] = prevSelectedRef.current;
    prevSelectedRef.current = [tier1, tier2];
    if (!tier1 || !tier2) return;
    if (comboInStock(tier1, tier2)) return;
    if (tier2 !== prevTier2 && tier1 === prevTier1) {
      onChange(0, null);
    } else {
      onChange(1, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected[0], selected[1], availability, variants]);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {options.map((option, optionIndex) => (
        <div key={option.name}>
          <Text strong id={`variant-option-${optionIndex}`} style={{ display: "block", marginBottom: 8 }}>
            {option.name}
          </Text>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            aria-label={option.name}
            value={selected[optionIndex] ?? undefined}
            onChange={(e) => onChange(optionIndex, e.target.value)}
          >
            <Space wrap size={8}>
              {option.values.map((value) => {
                const disabled = isValueDisabled(optionIndex, value);
                const button = (
                  <Radio.Button key={value} value={value} disabled={disabled}>
                    {value}
                  </Radio.Button>
                );
                return disabled ? (
                  <Tooltip key={value} title="Hết hàng">
                    {button}
                  </Tooltip>
                ) : (
                  button
                );
              })}
            </Space>
          </Radio.Group>
        </div>
      ))}
    </Space>
  );
}
