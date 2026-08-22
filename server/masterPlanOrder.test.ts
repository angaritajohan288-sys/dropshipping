import { describe, expect, it } from "vitest";
import { PHASES } from "../shared/staticPlan";

describe("mapa maestro de lanzamiento", () => {
  it("mantiene las acciones críticas antes de validación y construcción en cada fase", () => {
    expect(PHASES).toHaveLength(10);
    for (const phase of PHASES) {
      const ranks = phase.tasks.map(task => task.priority === "Crítica" ? 0 : task.priority === "Alta" ? 1 : 2);
      expect(ranks).toEqual([...ranks].sort((first, second) => first - second));
      expect(phase.tasks.every(task => !/^P[0-3]/.test(task.title))).toBe(true);
      expect(phase.tasks.at(-1)?.title).toContain("Cierre de fase");
    }
  });
});
