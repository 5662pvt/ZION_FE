const SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 500000;

export function estimateShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
