import { describe, expect, it } from "vitest";
import { calculateBusinessMetrics } from "../shared/businessMetrics";

describe("calculateBusinessMetrics", () => {
  it("calcula beneficio, margen, ROAS y ticket promedio sin punto flotante monetario", () => {
    expect(calculateBusinessMetrics({ revenueCents: 50_000, productCostCents: 18_000, adSpendCents: 12_000, orders: 10 })).toEqual({
      netProfitCents: 20_000,
      marginPercent: 40,
      roas: 50_000 / 12_000,
      averageOrderValueCents: 5_000,
    });
  });

  it("evita divisiones inválidas cuando todavía no existen ingresos, gasto o pedidos", () => {
    expect(calculateBusinessMetrics({ revenueCents: 0, productCostCents: 0, adSpendCents: 0, orders: 0 })).toEqual({
      netProfitCents: 0,
      marginPercent: 0,
      roas: 0,
      averageOrderValueCents: 0,
    });
  });
});
