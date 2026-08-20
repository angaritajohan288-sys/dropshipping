import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const monthlyPanel = readFileSync(new URL("../client/src/components/MonthlyMetricsPanel.tsx", import.meta.url), "utf-8");
const reminderPanel = readFileSync(new URL("../client/src/components/ReminderSettingsPanel.tsx", import.meta.url), "utf-8");
const homePage = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf-8");

describe("contrato de accesibilidad de los controles de análisis", () => {
  it("expone un selector CSV con nombre accesible y filtros nativos de mes", () => {
    expect(monthlyPanel).toContain('aria-label="Seleccionar CSV de métricas mensuales"');
    expect(monthlyPanel.match(/type="month"/g)).toHaveLength(2);
    expect(monthlyPanel).toContain("Plantilla CSV");
  });

  it("mantiene foco visible y controles semánticos para filtros y recordatorios", () => {
    expect(monthlyPanel.match(/focus:border-cyan-200\/70/g)?.length).toBeGreaterThanOrEqual(3);
    expect(homePage).toContain("Ver recordatorios");
    expect(homePage).toContain("<button");
  });

  it("expone exportación filtrada, anticipación y ordenamiento mediante controles accesibles", () => {
    expect(monthlyPanel).toContain("Exportar filtrado");
    expect(monthlyPanel).toContain("disabled={invalidRange || filteredRows.length === 0}");
    expect(reminderPanel).toContain('aria-label="Días de anticipación para recordatorios"');
    expect(reminderPanel).toContain("focus:border-amber-200/70");
    expect(homePage).toContain("Ordenar por vencimiento");
    expect(homePage).toContain("Restaurar orden del plan");
  });
});
