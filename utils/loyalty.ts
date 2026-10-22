export function computeRedeemablePoints(balance: number, maxRedeemPercent: number, eligibleAmount: number): number {
  if (balance <= 0 || eligibleAmount <= 0) return 0;
  const cap = Math.floor((eligibleAmount * maxRedeemPercent) / 100);
  return Math.min(balance, cap);
}

export function computeEstimatedEarnedPoints(eligibleAmount: number, earnRatePercent: number): number {
  if (eligibleAmount <= 0) return 0;
  return Math.floor((eligibleAmount * earnRatePercent) / 100);
}
