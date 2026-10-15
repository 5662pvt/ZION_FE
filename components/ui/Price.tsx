import { formatVnd } from "@/utils/money";

interface PriceProps {
  value: number;
  oldValue?: number;
  discountPercent?: number;
  size?: "default" | "large";
}

export default function Price({ value, oldValue, discountPercent, size = "default" }: PriceProps) {
  const fontSize = size === "large" ? 24 : 16;

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize, fontWeight: 700, color: "var(--color-text)" }}>{formatVnd(value)}</span>
      {oldValue !== undefined && oldValue > value && (
        <span
          style={{
            fontSize: fontSize * 0.75,
            color: "var(--color-muted)",
            textDecoration: "line-through",
          }}
        >
          {formatVnd(oldValue)}
        </span>
      )}
      {discountPercent !== undefined && discountPercent > 0 && (
        <span style={{ fontSize: fontSize * 0.7, fontWeight: 600, color: "var(--color-danger)" }}>
          -{discountPercent}%
        </span>
      )}
    </span>
  );
}
