import { describe, expect, it } from "vitest";
import { filterMonthlyHistory, isMonthlyRangeValid } from "../shared/monthlyHistoryFilters";

const rows = [
  { currency: "USD", monthKey: "2026-03", id: 1 },
  { currency: "EUR", monthKey: "2026-02", id: 2 },
  { currency: "USD", monthKey: "2026-01", id: 3 },
  { currency: "USD", monthKey: "2026-02", id: 4 },
];

describe("monthly history filters", () => {
  it("filtra por moneda y por rango inclusivo, ordenando de forma cronológica", () => {
    expect(filterMonthlyHistory(rows, { currency: "USD", startMonth: "2026-02", endMonth: "2026-03" }).map(row => row.monthKey)).toEqual(["2026-02", "2026-03"]);
  });

  it("rechaza rangos cuyo inicio es posterior al final", () => {
    expect(isMonthlyRangeValid("2026-04", "2026-03")).toBe(false);
    expect(filterMonthlyHistory(rows, { currency: "USD", startMonth: "2026-04", endMonth: "2026-03" })).toEqual([]);
  });

  it("devuelve una serie vacía sin alterar la validez cuando no hay meses que coincidan", () => {
    expect(isMonthlyRangeValid("2026-04", "2026-05")).toBe(true);
    expect(filterMonthlyHistory(rows, { currency: "USD", startMonth: "2026-04", endMonth: "2026-05" })).toEqual([]);
    expect(filterMonthlyHistory(rows, { currency: "COP" })).toEqual([]);
  });
});
