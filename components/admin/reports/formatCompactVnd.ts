function formatUnit(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1).replace(".", ",");
}

export function formatCompactVnd(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) return `${sign}${formatUnit(abs / 1_000_000_000)} tỷ`;
  if (abs >= 1_000_000) return `${sign}${formatUnit(abs / 1_000_000)}tr`;
  if (abs >= 1_000) return `${sign}${formatUnit(abs / 1_000)}k`;
  return `${sign}${abs}`;
}
