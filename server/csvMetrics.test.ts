import { describe, expect, it } from "vitest";
import { createMonthlyMetricsCsvTemplate, METRICS_CSV_HEADERS, parseMonthlyMetricsCsv } from "../shared/csvMetrics";

describe("parseMonthlyMetricsCsv", () => {
  it("documenta y convierte el contrato de importación a centavos", () => {
    const result = parseMonthlyMetricsCsv(`${METRICS_CSV_HEADERS.join(",")}\n2026-08,1250.50,425,120.25,32,USD`);
    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([{ monthKey: "2026-08", revenueCents: 125050, productCostCents: 42500, adSpendCents: 12025, orders: 32, currency: "USD" }]);
  });

  it("rechaza cabeceras, meses y valores que no cumplen el contrato", () => {
    const result = parseMonthlyMetricsCsv("month,revenue,orders,currency\n2026-13,10,2,USD");
    expect(result.rows).toEqual([]);
    expect(result.errors[0]).toContain("Faltan columnas requeridas");
  });

  it("acepta separador de punto y coma e importes con coma decimal", () => {
    const result = parseMonthlyMetricsCsv("currency;orders;adSpend;productCost;month;revenue\nEUR;5;20,50;35;2026-07;150,25");
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ monthKey: "2026-07", currency: "EUR", revenueCents: 15025, adSpendCents: 2050 });
  });

  it("ofrece una plantilla que el mismo parser acepta sin errores", () => {
    const result = parseMonthlyMetricsCsv(createMonthlyMetricsCsvTemplate());
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ monthKey: "2026-01", currency: "USD" });
  });
});
