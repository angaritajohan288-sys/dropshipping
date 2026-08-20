export type BusinessMetricInput = {
  revenueCents: number;
  productCostCents: number;
  adSpendCents: number;
  orders: number;
};

export function calculateBusinessMetrics(input: BusinessMetricInput) {
  const netProfitCents = input.revenueCents - input.productCostCents - input.adSpendCents;
  return {
    netProfitCents,
    marginPercent: input.revenueCents > 0 ? (netProfitCents / input.revenueCents) * 100 : 0,
    roas: input.adSpendCents > 0 ? input.revenueCents / input.adSpendCents : 0,
    averageOrderValueCents: input.orders > 0 ? input.revenueCents / input.orders : 0,
  };
}
